using Dapper;
using IDS_API_Project.Models;
using Microsoft.Data.SqlClient;

namespace IDS_API_Project.Repositories;

// reads are open to any logged in user, writes (Create/Update/Delete) are
// gated admin-only at the controller level, not here
public class TeamMemberRepository : ITeamMemberRepository
{
    private readonly string _connectionString;

    public TeamMemberRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("Default")!;
    }

    public async Task<List<TeamMember>> GetAll(string? fullName, string? department)
    {
        using var connection = new SqlConnection(_connectionString);

        const string sql = @"
            SELECT Id, FullName, JobTitle, Department, Email, Status
            FROM TeamMembers
            WHERE (@FullName IS NULL OR FullName LIKE '%' + @FullName + '%')
              AND (@Department IS NULL OR Department = @Department)
            ORDER BY FullName";

        var result = await connection.QueryAsync<TeamMember>(sql, new { FullName = fullName, Department = department });
        return result.ToList();
    }

    public async Task<TeamMember?> GetById(int id)
    {
        using var connection = new SqlConnection(_connectionString);
        const string sql = "SELECT Id, FullName, JobTitle, Department, Email, Status FROM TeamMembers WHERE Id = @Id";
        return await connection.QueryFirstOrDefaultAsync<TeamMember>(sql, new { Id = id });
    }

    public async Task<TeamMember> Create(TeamMember member)
    {
        using var connection = new SqlConnection(_connectionString);

        const string sql = @"
            INSERT INTO TeamMembers (FullName, JobTitle, Department, Email, Status)
            VALUES (@FullName, @JobTitle, @Department, @Email, @Status);
            SELECT CAST(SCOPE_IDENTITY() AS int);";

        var newId = await connection.ExecuteScalarAsync<int>(sql, member);
        return member with { Id = newId };
    }

    public async Task<TeamMember?> Update(int id, TeamMember member)
    {
        using var connection = new SqlConnection(_connectionString);

        const string sql = @"
            UPDATE TeamMembers
            SET FullName = @FullName, JobTitle = @JobTitle, Department = @Department, Email = @Email, Status = @Status
            WHERE Id = @Id";

        var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id, member.FullName, member.JobTitle, member.Department, member.Email, member.Status });
        return rowsAffected == 0 ? null : member with { Id = id };
    }

    public async Task<bool> Delete(int id)
    {
        using var connection = new SqlConnection(_connectionString);
        const string sql = "DELETE FROM TeamMembers WHERE Id = @Id";
        var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });
        return rowsAffected > 0;
    }
}
