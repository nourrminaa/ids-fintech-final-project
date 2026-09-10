using IDS_API_Project.Common;
using IDS_API_Project.Dtos;
using IDS_API_Project.Models;
using IDS_API_Project.Repositories;
using IDS_API_Project.Security;
using Microsoft.AspNetCore.Identity;

namespace IDS_API_Project.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly ITeamMemberRepository _teamMembers;
    private readonly JwtTokenGenerator _tokenGenerator;
    private readonly PasswordHasher<User> _passwordHasher = new();

    public AuthService(IUserRepository users, ITeamMemberRepository teamMembers, JwtTokenGenerator tokenGenerator)
    {
        _users = users;
        _teamMembers = teamMembers;
        _tokenGenerator = tokenGenerator;
    }

    public async Task<Result<LoginResponse>> Login(string email, string password)
    {
        var user = await _users.GetByEmail(email);
        if (user is null)
            return Result<LoginResponse>.Fail("Incorrect email or password");

        // same message either way on purpose, telling someone "that email does
        // not exist" versus "wrong password" is a small gift to an attacker
        var verification = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, password);
        if (verification == PasswordVerificationResult.Failed)
            return Result<LoginResponse>.Fail("Incorrect email or password");

        if (!user.IsActive)
            return Result<LoginResponse>.Fail("This account has been deactivated");

        var teamMember = user.TeamMemberId is not null ? await _teamMembers.GetById(user.TeamMemberId.Value) : null;
        var fullName = teamMember?.FullName ?? user.Email.Split('@')[0];

        var token = _tokenGenerator.GenerateToken(user);

        return Result<LoginResponse>.Ok(new LoginResponse(token, user.Id, user.Email, user.Role, user.TeamMemberId, fullName));
    }
}
