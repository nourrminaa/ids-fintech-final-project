using IDS_API_Project.Common;
using IDS_API_Project.Dtos;
using IDS_API_Project.Models;
using IDS_API_Project.Repositories;
using Microsoft.AspNetCore.Identity;

namespace IDS_API_Project.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _repo;
    private readonly PasswordHasher<User> _passwordHasher = new();

    public UserService(IUserRepository repo)
    {
        _repo = repo;
    }

    // strips PasswordHash off before anything leaves this service, controllers
    // never even get the chance to accidentally serialize it
    private static UserResponse ToResponse(User user) => new(user.Id, user.Email, user.Role, user.IsActive, user.TeamMemberId);

    public async Task<List<UserResponse>> GetAll()
    {
        var users = await _repo.GetAll();
        return users.Select(ToResponse).ToList();
    }

    private static readonly string[] ValidRoles = { "Admin", "Employee" };

    public async Task<Result<UserResponse>> Create(CreateUserRequest request)
    {
        // the DB's CHECK constraint on Role runs case-insensitively under SQL
        // Server's default collation, but [Authorize(Policy = "AdminOnly")]
        // checks the role claim case-sensitively, so a value like "admin" would
        // pass the DB and then never be able to reach a single AdminOnly
        // endpoint again, catch that here instead of finding out the hard way
        if (!ValidRoles.Contains(request.Role))
            return Result<UserResponse>.Fail($"Role must be one of: {string.Join(", ", ValidRoles)}");

        var existing = await _repo.GetByEmail(request.Email);
        if (existing is not null)
            return Result<UserResponse>.Fail("A user with this email already exists");

        // PasswordHasher wants a TUser instance to hash against, it does not
        // actually read anything off it for the default hashing algorithm, so
        // a placeholder with an empty hash is fine here, the real hash gets
        // filled in right after
        var placeholder = new User(0, request.Email, "", request.Role, true, request.TeamMemberId);
        var hash = _passwordHasher.HashPassword(placeholder, request.Password);

        var created = await _repo.Create(placeholder with { PasswordHash = hash });
        return Result<UserResponse>.Ok(ToResponse(created));
    }

    public async Task<Result<UserResponse>> UpdateRoleAndStatus(int id, UpdateUserRequest request)
    {
        if (request.Role is not null && !ValidRoles.Contains(request.Role))
            return Result<UserResponse>.Fail($"Role must be one of: {string.Join(", ", ValidRoles)}");

        var updated = await _repo.UpdateRoleAndStatus(id, request.Role, request.IsActive, request.TeamMemberId);
        return updated is null ? Result<UserResponse>.Fail("User not found") : Result<UserResponse>.Ok(ToResponse(updated));
    }
}