using Dapper;
using IDS_API_Project.Dtos;
using IDS_API_Project.Models;
using Microsoft.Data.SqlClient;

namespace IDS_API_Project.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly string _connectionString;

    public ProductRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("Default")!;
    }

    // Products stores SupportedMarkets/Technologies as a comma separated string,
    // this row shape matches the raw columns so Dapper can map it directly,
    // then MapRow turns it into the Product the rest of the app actually uses
    private record ProductRow(
        int Id, string Name, string Description, string BusinessPurpose, string LifecycleStatus,
        string CurrentVersion, string SupportedMarkets, string Criticality, string Technologies, string? Notes
    );

    private static Product MapRow(ProductRow row) => new(
        row.Id, row.Name, row.Description, row.BusinessPurpose, row.LifecycleStatus, row.CurrentVersion,
        SplitList(row.SupportedMarkets), row.Criticality, SplitList(row.Technologies), row.Notes
    );

    private static List<string> SplitList(string value) =>
        string.IsNullOrWhiteSpace(value)
            ? new List<string>()
            : value.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

    private static string JoinList(List<string> values) => string.Join(",", values);

    public async Task<List<Product>> GetAll(string? name, string? lifecycleStatus, string? technology)
    {
        using var connection = new SqlConnection(_connectionString);

        // technology is stored comma separated so we match it with LIKE, same
        // trick the frontend already does client side with Array.includes
        const string sql = @"
            SELECT Id, Name, Description, BusinessPurpose, LifecycleStatus, CurrentVersion,
                   SupportedMarkets, Criticality, Technologies, Notes
            FROM Products
            WHERE (@Name IS NULL OR Name LIKE '%' + @Name + '%')
              AND (@LifecycleStatus IS NULL OR LifecycleStatus = @LifecycleStatus)
              AND (@Technology IS NULL OR Technologies LIKE '%' + @Technology + '%')
            ORDER BY Name";

        var rows = await connection.QueryAsync<ProductRow>(sql, new { Name = name, LifecycleStatus = lifecycleStatus, Technology = technology });
        return rows.Select(MapRow).ToList();
    }

    public async Task<ProductDetails?> GetDetails(int id)
    {
        using var connection = new SqlConnection(_connectionString);

        /* one round trip for the whole Product Details page, this is the
           "purpose built query per screen" idea from the architecture notes,
           instead of five separate GetById style calls stitched together in C# */
        const string sql = @"
            SELECT Id, Name, Description, BusinessPurpose, LifecycleStatus, CurrentVersion,
                   SupportedMarkets, Criticality, Technologies, Notes
            FROM Products WHERE Id = @Id;

            SELECT Id, ProductId, Name, Description, Status FROM Modules WHERE ProductId = @Id;

            SELECT DISTINCT c.Id, c.CompanyName, c.Country, c.ContactInformation, c.Status, c.Notes
            FROM Clients c
            JOIN Deployments d ON d.ClientId = c.Id
            WHERE d.ProductId = @Id;

            SELECT pr.Id, pr.ProductId, pr.TeamMemberId, tm.FullName AS TeamMemberName, pr.Responsibility, pr.Description
            FROM ProductResponsibilities pr
            JOIN TeamMembers tm ON tm.Id = pr.TeamMemberId
            WHERE pr.ProductId = @Id;

            SELECT Id, ProductId, Name, GitHubUrl, MainBranch, Description FROM Repositories WHERE ProductId = @Id;

            SELECT Id, ProductId, DocumentName, DocumentType, Description, UrlOrFileReference, LastUpdatedDate
            FROM Documents WHERE ProductId = @Id;";

        using var multi = await connection.QueryMultipleAsync(sql, new { Id = id });

        var productRow = await multi.ReadFirstOrDefaultAsync<ProductRow>();
        if (productRow is null)
            return null;

        var modules = (await multi.ReadAsync<Module>()).ToList();
        var clients = (await multi.ReadAsync<Client>()).ToList();
        var responsibleTeam = (await multi.ReadAsync<ProductResponsibilityView>()).ToList();
        var repositories = (await multi.ReadAsync<RepositoryLink>()).ToList();
        var documents = (await multi.ReadAsync<ProductDocument>()).ToList();

        return new ProductDetails(MapRow(productRow), modules, clients, responsibleTeam, repositories, documents, CanEdit: false);
    }

    public async Task<Product> Create(Product product)
    {
        using var connection = new SqlConnection(_connectionString);

        const string sql = @"
            INSERT INTO Products (Name, Description, BusinessPurpose, LifecycleStatus, CurrentVersion, SupportedMarkets, Criticality, Technologies, Notes)
            VALUES (@Name, @Description, @BusinessPurpose, @LifecycleStatus, @CurrentVersion, @SupportedMarkets, @Criticality, @Technologies, @Notes);
            SELECT CAST(SCOPE_IDENTITY() AS int);";

        var newId = await connection.ExecuteScalarAsync<int>(sql, new
        {
            product.Name,
            product.Description,
            product.BusinessPurpose,
            product.LifecycleStatus,
            product.CurrentVersion,
            SupportedMarkets = JoinList(product.SupportedMarkets),
            product.Criticality,
            Technologies = JoinList(product.Technologies),
            product.Notes
        });

        return product with { Id = newId };
    }

    public async Task<Product?> Update(int id, Product product)
    {
        using var connection = new SqlConnection(_connectionString);

        const string sql = @"
            UPDATE Products
            SET Name = @Name, Description = @Description, BusinessPurpose = @BusinessPurpose,
                LifecycleStatus = @LifecycleStatus, CurrentVersion = @CurrentVersion,
                SupportedMarkets = @SupportedMarkets, Criticality = @Criticality,
                Technologies = @Technologies, Notes = @Notes
            WHERE Id = @Id";

        var rowsAffected = await connection.ExecuteAsync(sql, new
        {
            Id = id,
            product.Name,
            product.Description,
            product.BusinessPurpose,
            product.LifecycleStatus,
            product.CurrentVersion,
            SupportedMarkets = JoinList(product.SupportedMarkets),
            product.Criticality,
            Technologies = JoinList(product.Technologies),
            product.Notes
        });

        return rowsAffected == 0 ? null : product with { Id = id };
    }

    public async Task<bool> Delete(int id)
    {
        using var connection = new SqlConnection(_connectionString);
        const string sql = "DELETE FROM Products WHERE Id = @Id";
        var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });
        return rowsAffected > 0;
    }

    public async Task<Module> AddModule(int productId, Module module)
    {
        using var connection = new SqlConnection(_connectionString);

        const string sql = @"
            INSERT INTO Modules (ProductId, Name, Description, Status)
            VALUES (@ProductId, @Name, @Description, @Status);
            SELECT CAST(SCOPE_IDENTITY() AS int);";

        var newId = await connection.ExecuteScalarAsync<int>(sql, new { ProductId = productId, module.Name, module.Description, module.Status });
        return module with { Id = newId, ProductId = productId };
    }

    public async Task<bool> DeleteModule(int moduleId)
    {
        using var connection = new SqlConnection(_connectionString);
        const string sql = "DELETE FROM Modules WHERE Id = @Id";
        var rowsAffected = await connection.ExecuteAsync(sql, new { Id = moduleId });
        return rowsAffected > 0;
    }

    public async Task<bool> IsTeamMemberAssigned(int productId, int teamMemberId)
    {
        using var connection = new SqlConnection(_connectionString);

        const string sql = @"
            SELECT COUNT(1) FROM ProductResponsibilities
            WHERE ProductId = @ProductId AND TeamMemberId = @TeamMemberId";

        var count = await connection.ExecuteScalarAsync<int>(sql, new { ProductId = productId, TeamMemberId = teamMemberId });
        return count > 0;
    }

    public async Task<ProductResponsibilityView> AddResponsibility(int productId, int teamMemberId, string responsibility, string? description)
    {
        using var connection = new SqlConnection(_connectionString);

        const string insertSql = @"
            INSERT INTO ProductResponsibilities (ProductId, TeamMemberId, Responsibility, Description)
            VALUES (@ProductId, @TeamMemberId, @Responsibility, @Description);
            SELECT CAST(SCOPE_IDENTITY() AS int);";

        var newId = await connection.ExecuteScalarAsync<int>(insertSql, new { ProductId = productId, TeamMemberId = teamMemberId, Responsibility = responsibility, Description = description });

        // grab the name too, so the frontend gets the same shape back that
        // GetDetails would have given it, no need for a second round trip
        const string nameSql = "SELECT FullName FROM TeamMembers WHERE Id = @Id";
        var teamMemberName = await connection.ExecuteScalarAsync<string>(nameSql, new { Id = teamMemberId });

        return new ProductResponsibilityView(newId, productId, teamMemberId, teamMemberName, responsibility, description);
    }

    public async Task<bool> DeleteResponsibility(int responsibilityId)
    {
        using var connection = new SqlConnection(_connectionString);
        const string sql = "DELETE FROM ProductResponsibilities WHERE Id = @Id";
        var rowsAffected = await connection.ExecuteAsync(sql, new { Id = responsibilityId });
        return rowsAffected > 0;
    }

    public async Task<RepositoryLink> AddRepository(int productId, RepositoryLink repository)
    {
        using var connection = new SqlConnection(_connectionString);

        const string sql = @"
            INSERT INTO Repositories (ProductId, Name, GitHubUrl, MainBranch, Description)
            VALUES (@ProductId, @Name, @GitHubUrl, @MainBranch, @Description);
            SELECT CAST(SCOPE_IDENTITY() AS int);";

        var newId = await connection.ExecuteScalarAsync<int>(sql, new { ProductId = productId, repository.Name, repository.GitHubUrl, repository.MainBranch, repository.Description });
        return repository with { Id = newId, ProductId = productId };
    }

    public async Task<bool> DeleteRepository(int repositoryId)
    {
        using var connection = new SqlConnection(_connectionString);
        const string sql = "DELETE FROM Repositories WHERE Id = @Id";
        var rowsAffected = await connection.ExecuteAsync(sql, new { Id = repositoryId });
        return rowsAffected > 0;
    }

    public async Task<ProductDocument> AddDocument(int productId, ProductDocument document)
    {
        using var connection = new SqlConnection(_connectionString);

        const string sql = @"
            INSERT INTO Documents (ProductId, DocumentName, DocumentType, Description, UrlOrFileReference, LastUpdatedDate)
            VALUES (@ProductId, @DocumentName, @DocumentType, @Description, @UrlOrFileReference, @LastUpdatedDate);
            SELECT CAST(SCOPE_IDENTITY() AS int);";

        var newId = await connection.ExecuteScalarAsync<int>(sql, new
        {
            ProductId = productId,
            document.DocumentName,
            document.DocumentType,
            document.Description,
            document.UrlOrFileReference,
            document.LastUpdatedDate
        });

        return document with { Id = newId, ProductId = productId };
    }

    public async Task<bool> DeleteDocument(int documentId)
    {
        using var connection = new SqlConnection(_connectionString);
        const string sql = "DELETE FROM Documents WHERE Id = @Id";
        var rowsAffected = await connection.ExecuteAsync(sql, new { Id = documentId });
        return rowsAffected > 0;
    }
}
