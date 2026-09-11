using Dapper;
using IDS_API_Project.Dtos;
using IDS_API_Project.Models;
using Microsoft.Data.SqlClient;
// ImplicitUsings pulls in a global "using System;", which makes the bare name
// Environment ambiguous with System.Environment, this alias is the fix
using Environment = IDS_API_Project.Models.Environment;

namespace IDS_API_Project.Repositories;

public class ClientRepository : IClientRepository
{
    private readonly string _connectionString;

    public ClientRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("Default")!;
    }

    // raw shape of one deployment row before it gets turned into a DeploymentView,
    // ProductName comes along for the ride through a join so the client details
    // page does not need a separate lookup per deployment
    private record DeploymentRow(
        int Id, int ProductId, string ProductName, string ProductVersion, DateTime? GoLiveDate,
        string DeploymentStatus, string SupportTier, string? ClientSpecificNotes
    );

    // carries DeploymentId along for grouping, EnvironmentSummary itself does not
    // have that column since it is meant to sit nested under one deployment
    private record EnvironmentRow(
        int Id, string EnvironmentName, string EnvironmentType, string? Purpose, string? ServerName,
        string? OperatingSystem, string? ApplicationUrl, string? DatabaseInfo, string? MonitoringLink,
        string? AccessInstructions, string? Notes, int DeploymentId
    );

    public async Task<List<Client>> GetAll(string? companyName, string? country, int? productId)
    {
        using var connection = new SqlConnection(_connectionString);

        // filtering by product means "clients that have a deployment of this
        // product", so this needs a join even though productId does not live
        // on the Clients table itself
        const string sql = @"
            SELECT DISTINCT c.Id, c.CompanyName, c.Country, c.ContactInformation, c.Status, c.Notes
            FROM Clients c
            LEFT JOIN Deployments d ON d.ClientId = c.Id
            WHERE (@CompanyName IS NULL OR c.CompanyName LIKE '%' + @CompanyName + '%')
              AND (@Country IS NULL OR c.Country = @Country)
              AND (@ProductId IS NULL OR d.ProductId = @ProductId)
            ORDER BY c.CompanyName";

        var result = await connection.QueryAsync<Client>(sql, new { CompanyName = companyName, Country = country, ProductId = productId });
        return result.ToList();
    }

    public async Task<ClientDetails?> GetDetails(int id)
    {
        using var connection = new SqlConnection(_connectionString);

        /* one round trip for the whole Client Details page, same reasoning as
           ProductRepository.GetDetails, five queries batched together instead
           of five separate awaits back and forth to the database. Responsible
           Team here is ClientResponsibility only, no more folding in whoever
           is responsible for a product this client happens to use */
        const string sql = @"
            SELECT Id, CompanyName, Country, ContactInformation, Status, Notes FROM Clients WHERE Id = @Id;

            SELECT d.Id, d.ProductId, p.Name AS ProductName, d.ProductVersion, d.GoLiveDate,
                   d.DeploymentStatus, d.SupportTier, d.ClientSpecificNotes
            FROM Deployments d
            JOIN Products p ON p.Id = d.ProductId
            WHERE d.ClientId = @Id;

            SELECT m.Id, m.ProductId, m.Name, m.Description, m.Status
            FROM Modules m
            WHERE m.ProductId IN (SELECT ProductId FROM Deployments WHERE ClientId = @Id);

            SELECT dm.Id, dm.DeploymentId, dm.ModuleId
            FROM DeploymentModules dm
            WHERE dm.DeploymentId IN (SELECT Id FROM Deployments WHERE ClientId = @Id);

            SELECT e.Id, e.EnvironmentName, e.EnvironmentType, e.Purpose, e.ServerName, e.OperatingSystem,
                   e.ApplicationUrl, e.DatabaseInfo, e.MonitoringLink, e.AccessInstructions, e.Notes, e.DeploymentId
            FROM Environments e
            WHERE e.DeploymentId IN (SELECT Id FROM Deployments WHERE ClientId = @Id);

            SELECT cr.Id, cr.ClientId, cr.TeamMemberId, tm.FullName AS TeamMemberName, cr.Responsibility, cr.Description
            FROM ClientResponsibilities cr
            JOIN TeamMembers tm ON tm.Id = cr.TeamMemberId
            WHERE cr.ClientId = @Id;";

        using var multi = await connection.QueryMultipleAsync(sql, new { Id = id });

        var client = await multi.ReadFirstOrDefaultAsync<Client>();
        if (client is null)
            return null;

        var deploymentRows = (await multi.ReadAsync<DeploymentRow>()).ToList();
        var modules = (await multi.ReadAsync<Module>()).ToList();
        var deploymentModules = (await multi.ReadAsync<DeploymentModule>()).ToList();

        var environmentRows = (await multi.ReadAsync<EnvironmentRow>()).ToList();

        var responsibleTeam = (await multi.ReadAsync<ClientResponsibilityView>()).ToList();

        var deployments = deploymentRows.Select(row => new DeploymentView(
            row.Id,
            row.ProductId,
            row.ProductName,
            row.ProductVersion,
            row.GoLiveDate,
            row.DeploymentStatus,
            row.SupportTier,
            row.ClientSpecificNotes,
            modules.Where(m => m.ProductId == row.ProductId).ToList(),
            deploymentModules.Where(dm => dm.DeploymentId == row.Id).Select(dm => dm.ModuleId).ToList(),
            environmentRows.Where(e => e.DeploymentId == row.Id)
                .Select(e => new EnvironmentSummary(e.Id, e.EnvironmentName, e.EnvironmentType, e.Purpose, e.ServerName, e.OperatingSystem, e.ApplicationUrl, e.DatabaseInfo, e.MonitoringLink, e.AccessInstructions, e.Notes))
                .ToList()
        )).ToList();

        // CanEdit gets filled in by the service layer, which knows who's
        // actually asking, this repo layer has no ClaimsPrincipal to check
        return new ClientDetails(client, deployments, responsibleTeam, CanEdit: false);
    }

    public async Task<Client> Create(Client client)
    {
        using var connection = new SqlConnection(_connectionString);

        const string sql = @"
            INSERT INTO Clients (CompanyName, Country, ContactInformation, Status, Notes)
            VALUES (@CompanyName, @Country, @ContactInformation, @Status, @Notes);
            SELECT CAST(SCOPE_IDENTITY() AS int);";

        var newId = await connection.ExecuteScalarAsync<int>(sql, client);
        return client with { Id = newId };
    }

    public async Task<Client?> Update(int id, Client client)
    {
        using var connection = new SqlConnection(_connectionString);

        const string sql = @"
            UPDATE Clients
            SET CompanyName = @CompanyName, Country = @Country, ContactInformation = @ContactInformation,
                Status = @Status, Notes = @Notes
            WHERE Id = @Id";

        var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id, client.CompanyName, client.Country, client.ContactInformation, client.Status, client.Notes });
        return rowsAffected == 0 ? null : client with { Id = id };
    }

    public async Task<bool> Delete(int id)
    {
        using var connection = new SqlConnection(_connectionString);
        const string sql = "DELETE FROM Clients WHERE Id = @Id";
        var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });
        return rowsAffected > 0;
    }

    public async Task<Deployment> AddDeployment(int clientId, Deployment deployment)
    {
        using var connection = new SqlConnection(_connectionString);

        // modules are not set at creation time, same as the frontend, they get
        // toggled afterwards from the deployment card itself
        const string sql = @"
            INSERT INTO Deployments (ClientId, ProductId, ProductVersion, GoLiveDate, DeploymentStatus, SupportTier, ClientSpecificNotes)
            VALUES (@ClientId, @ProductId, @ProductVersion, @GoLiveDate, @DeploymentStatus, @SupportTier, @ClientSpecificNotes);
            SELECT CAST(SCOPE_IDENTITY() AS int);";

        var newId = await connection.ExecuteScalarAsync<int>(sql, new
        {
            ClientId = clientId,
            deployment.ProductId,
            deployment.ProductVersion,
            deployment.GoLiveDate,
            deployment.DeploymentStatus,
            deployment.SupportTier,
            deployment.ClientSpecificNotes
        });

        return deployment with { Id = newId, ClientId = clientId };
    }

    public async Task<bool> EnableModule(int clientId, int deploymentId, int moduleId)
    {
        using var connection = new SqlConnection(_connectionString);

        // only touches DeploymentModules if this deployment actually belongs to
        // clientId, SELECT at the end reports back whether that was true so the
        // service can tell "not your deployment" apart from success. IF NOT
        // EXISTS on the insert itself keeps this endpoint safe to call twice in
        // a row, same as before
        const string sql = @"
            IF EXISTS (SELECT 1 FROM Deployments WHERE Id = @DeploymentId AND ClientId = @ClientId)
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM DeploymentModules WHERE DeploymentId = @DeploymentId AND ModuleId = @ModuleId)
                    INSERT INTO DeploymentModules (DeploymentId, ModuleId) VALUES (@DeploymentId, @ModuleId)
                SELECT 1
            END
            ELSE
                SELECT 0";

        var ownedByClient = await connection.ExecuteScalarAsync<int>(sql, new { ClientId = clientId, DeploymentId = deploymentId, ModuleId = moduleId });
        return ownedByClient == 1;
    }

    public async Task<bool> DisableModule(int clientId, int deploymentId, int moduleId)
    {
        using var connection = new SqlConnection(_connectionString);

        const string sql = @"
            IF EXISTS (SELECT 1 FROM Deployments WHERE Id = @DeploymentId AND ClientId = @ClientId)
            BEGIN
                DELETE FROM DeploymentModules WHERE DeploymentId = @DeploymentId AND ModuleId = @ModuleId
                SELECT 1
            END
            ELSE
                SELECT 0";

        var ownedByClient = await connection.ExecuteScalarAsync<int>(sql, new { ClientId = clientId, DeploymentId = deploymentId, ModuleId = moduleId });
        return ownedByClient == 1;
    }

    // adds one Environment row under a deployment, same insert-then-select-scope-identity
    // shape as every other Create in this file. Returns null instead of creating
    // anything if deploymentId does not actually belong to clientId
    public async Task<Environment?> AddEnvironment(int clientId, int deploymentId, Environment environment)
    {
        using var connection = new SqlConnection(_connectionString);

        const string checkSql = "SELECT COUNT(1) FROM Deployments WHERE Id = @DeploymentId AND ClientId = @ClientId";
        var owned = await connection.ExecuteScalarAsync<int>(checkSql, new { DeploymentId = deploymentId, ClientId = clientId });
        if (owned == 0)
            return null;

        const string sql = @"
            INSERT INTO Environments (DeploymentId, EnvironmentName, EnvironmentType, Purpose, ServerName,
                                       OperatingSystem, ApplicationUrl, DatabaseInfo, MonitoringLink, AccessInstructions, Notes)
            VALUES (@DeploymentId, @EnvironmentName, @EnvironmentType, @Purpose, @ServerName,
                    @OperatingSystem, @ApplicationUrl, @DatabaseInfo, @MonitoringLink, @AccessInstructions, @Notes);
            SELECT CAST(SCOPE_IDENTITY() AS int);";

        var newId = await connection.ExecuteScalarAsync<int>(sql, new
        {
            DeploymentId = deploymentId,
            environment.EnvironmentName,
            environment.EnvironmentType,
            environment.Purpose,
            environment.ServerName,
            environment.OperatingSystem,
            environment.ApplicationUrl,
            environment.DatabaseInfo,
            environment.MonitoringLink,
            environment.AccessInstructions,
            environment.Notes
        });

        return environment with { Id = newId, DeploymentId = deploymentId };
    }

    // DeploymentId is intentionally not updatable here, an environment does
    // not move to a different deployment, it only ever gets edited in place.
    // Joins through Deployments so an environment can only be reached via its
    // own client's route, closing the cross-client IDOR
    public async Task<Environment?> UpdateEnvironment(int clientId, int environmentId, Environment environment)
    {
        using var connection = new SqlConnection(_connectionString);

        const string sql = @"
            UPDATE e
            SET EnvironmentName = @EnvironmentName, EnvironmentType = @EnvironmentType, Purpose = @Purpose,
                ServerName = @ServerName, OperatingSystem = @OperatingSystem, ApplicationUrl = @ApplicationUrl,
                DatabaseInfo = @DatabaseInfo, MonitoringLink = @MonitoringLink, AccessInstructions = @AccessInstructions,
                Notes = @Notes
            FROM Environments e
            JOIN Deployments d ON d.Id = e.DeploymentId
            WHERE e.Id = @Id AND d.ClientId = @ClientId";

        var rowsAffected = await connection.ExecuteAsync(sql, new
        {
            Id = environmentId,
            ClientId = clientId,
            environment.EnvironmentName,
            environment.EnvironmentType,
            environment.Purpose,
            environment.ServerName,
            environment.OperatingSystem,
            environment.ApplicationUrl,
            environment.DatabaseInfo,
            environment.MonitoringLink,
            environment.AccessInstructions,
            environment.Notes
        });

        return rowsAffected == 0 ? null : environment with { Id = environmentId };
    }

    public async Task<bool> DeleteEnvironment(int clientId, int environmentId)
    {
        using var connection = new SqlConnection(_connectionString);
        const string sql = @"
            DELETE e FROM Environments e
            JOIN Deployments d ON d.Id = e.DeploymentId
            WHERE e.Id = @Id AND d.ClientId = @ClientId";
        var rowsAffected = await connection.ExecuteAsync(sql, new { Id = environmentId, ClientId = clientId });
        return rowsAffected > 0;
    }

    public async Task<bool> IsTeamMemberAssigned(int clientId, int teamMemberId)
    {
        using var connection = new SqlConnection(_connectionString);

        const string sql = @"
            SELECT COUNT(1) FROM ClientResponsibilities
            WHERE ClientId = @ClientId AND TeamMemberId = @TeamMemberId";

        var count = await connection.ExecuteScalarAsync<int>(sql, new { ClientId = clientId, TeamMemberId = teamMemberId });
        return count > 0;
    }

    public async Task<ClientResponsibilityView> AddResponsibility(int clientId, int teamMemberId, string responsibility, string? description)
    {
        using var connection = new SqlConnection(_connectionString);

        const string insertSql = @"
            INSERT INTO ClientResponsibilities (ClientId, TeamMemberId, Responsibility, Description)
            VALUES (@ClientId, @TeamMemberId, @Responsibility, @Description);
            SELECT CAST(SCOPE_IDENTITY() AS int);";

        var newId = await connection.ExecuteScalarAsync<int>(insertSql, new { ClientId = clientId, TeamMemberId = teamMemberId, Responsibility = responsibility, Description = description });

        // grab the name too, same reasoning as ProductRepository.AddResponsibility,
        // so the frontend gets back the same shape GetDetails would have given it
        const string nameSql = "SELECT FullName FROM TeamMembers WHERE Id = @Id";
        var teamMemberName = await connection.ExecuteScalarAsync<string>(nameSql, new { Id = teamMemberId });

        return new ClientResponsibilityView(newId, clientId, teamMemberId, teamMemberName, responsibility, description);
    }

    public async Task<bool> DeleteResponsibility(int clientId, int responsibilityId)
    {
        using var connection = new SqlConnection(_connectionString);
        const string sql = "DELETE FROM ClientResponsibilities WHERE Id = @Id AND ClientId = @ClientId";
        var rowsAffected = await connection.ExecuteAsync(sql, new { Id = responsibilityId, ClientId = clientId });
        return rowsAffected > 0;
    }
}