using Dapper;
using IDS_API_Project.Models;
using Microsoft.Data.SqlClient;

namespace IDS_API_Project.Repositories;

public class UserRepository : IUserRepository
{
    private readonly string _connectionString;

    public UserRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("Default")!;
    }

    public async Task<User?> GetByEmail(string email)
    {
        using var connection = new SqlConnection(_connectionString);
        const string sql = "SELECT Id, Email, PasswordHash, Role, IsActive, TeamMemberId FROM Users WHERE Email = @Email";
        return await connection.QueryFirstOrDefaultAsync<User>(sql, new { Email = email });
    }

    public async Task<User?> GetById(int id)
    {
        using var connection = new SqlConnection(_connectionString);
        const string sql = "SELECT Id, Email, PasswordHash, Role, IsActive, TeamMemberId FROM Users WHERE Id = @Id";
        return await connection.QueryFirstOrDefaultAsync<User>(sql, new { Id = id });
    }

    public async Task<List<User>> GetAll()
    {
        using var connection = new SqlConnection(_connectionString);
        const string sql = "SELECT Id, Email, PasswordHash, Role, IsActive, TeamMemberId FROM Users ORDER BY Email";
        var result = await connection.QueryAsync<User>(sql);
        return result.ToList();
    }

    public async Task<User> Create(User user)
    {
        using var connection = new SqlConnection(_connectionString);

        // SCOPE_IDENTITY picks up the id SQL Server just generated for us, so
        // we can hand back the full record without a second round trip
        const string sql = @"
            INSERT INTO Users (Email, PasswordHash, Role, IsActive, TeamMemberId)
            VALUES (@Email, @PasswordHash, @Role, @IsActive, @TeamMemberId);
            SELECT CAST(SCOPE_IDENTITY() AS int);";

        var newId = await connection.ExecuteScalarAsync<int>(sql, user);
        return user with { Id = newId };
    }

    public async Task<User?> UpdateRoleAndStatus(int id, string? role, bool? isActive, int? teamMemberId)
    {
        using var connection = new SqlConnection(_connectionString);

        // only touch the columns that were actually passed in, this is why role,
        // isActive and teamMemberId are all nullable on the request, the admin
        // screen changes them independently of each other. note this means you
        // cannot unlink a team member back to null through this endpoint, only
        // ever set it to a real id, same limitation already applied to role
        const string sql = @"
            UPDATE Users
            SET Role = COALESCE(@Role, Role),
                IsActive = COALESCE(@IsActive, IsActive),
                TeamMemberId = COALESCE(@TeamMemberId, TeamMemberId)
            WHERE Id = @Id;
            SELECT Id, Email, PasswordHash, Role, IsActive, TeamMemberId FROM Users WHERE Id = @Id;";

        return await connection.QueryFirstOrDefaultAsync<User>(sql, new { Id = id, Role = role, IsActive = isActive, TeamMemberId = teamMemberId });
    }
}
