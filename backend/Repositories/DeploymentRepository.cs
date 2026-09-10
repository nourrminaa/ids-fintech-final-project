using Dapper;
using IDS_API_Project.Dtos;
using Microsoft.Data.SqlClient;

namespace IDS_API_Project.Repositories;

public class DeploymentRepository : IDeploymentRepository
{
    private readonly string _connectionString;

    public DeploymentRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("Default")!;
    }

    public async Task<List<DeploymentListItem>> GetAll(int? productId, int? clientId, string? status)
    {
        using var connection = new SqlConnection(_connectionString);

        const string sql = @"
            SELECT d.Id, d.ClientId, c.CompanyName AS ClientName, d.ProductId, p.Name AS ProductName,
                   d.ProductVersion, d.GoLiveDate, d.DeploymentStatus, d.SupportTier
            FROM Deployments d
            JOIN Clients c ON c.Id = d.ClientId
            JOIN Products p ON p.Id = d.ProductId
            WHERE (@ProductId IS NULL OR d.ProductId = @ProductId)
              AND (@ClientId IS NULL OR d.ClientId = @ClientId)
              AND (@Status IS NULL OR d.DeploymentStatus = @Status)
            ORDER BY d.GoLiveDate DESC";

        var result = await connection.QueryAsync<DeploymentListItem>(sql, new { ProductId = productId, ClientId = clientId, Status = status });
        return result.ToList();
    }
}
