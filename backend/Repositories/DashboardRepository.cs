using Dapper;
using IDS_API_Project.Dtos;
using IDS_API_Project.Models;
using Microsoft.Data.SqlClient;

namespace IDS_API_Project.Repositories;

public class DashboardRepository : IDashboardRepository
{
    private readonly string _connectionString;

    public DashboardRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("Default")!;
    }

    // Products does not have an UpdatedAt column yet, so "recently updated" is
    // really just "highest Id first" for now, same limitation the mock frontend
    // had, flagged here so whoever adds real timestamps later knows to swap this
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

    public async Task<DashboardSummary> GetSummary()
    {
        using var connection = new SqlConnection(_connectionString);

        const string sql = @"
            SELECT COUNT(*) FROM Products;
            SELECT COUNT(*) FROM Products WHERE LifecycleStatus = 'Active';
            SELECT COUNT(*) FROM Clients;
            SELECT COUNT(*) FROM Deployments;
            SELECT COUNT(*) FROM TeamMembers;
            SELECT TOP 3 Id, Name, Description, BusinessPurpose, LifecycleStatus, CurrentVersion,
                   SupportedMarkets, Criticality, Technologies, Notes
            FROM Products ORDER BY Id DESC;";

        using var multi = await connection.QueryMultipleAsync(sql);

        var totalProducts = await multi.ReadFirstAsync<int>();
        var activeProducts = await multi.ReadFirstAsync<int>();
        var totalClients = await multi.ReadFirstAsync<int>();
        var totalDeployments = await multi.ReadFirstAsync<int>();
        var totalTeamMembers = await multi.ReadFirstAsync<int>();
        var recentRows = (await multi.ReadAsync<ProductRow>()).ToList();

        return new DashboardSummary(
            totalProducts, activeProducts, totalClients, totalDeployments, totalTeamMembers,
            recentRows.Select(MapRow).ToList()
        );
    }
}
