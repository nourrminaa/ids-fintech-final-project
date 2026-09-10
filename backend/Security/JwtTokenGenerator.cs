using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using IDS_API_Project.Models;
using Microsoft.IdentityModel.Tokens;

namespace IDS_API_Project.Security;

/* builds the JWT the frontend stores after a successful login, and sends back
   on every request after that, the token carries the user's id, role and
   TeamMemberId as claims so controllers can read them straight off
   HttpContext.User without another database call */
public class JwtTokenGenerator
{
    private readonly string _secret;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly int _expiryMinutes;

    public JwtTokenGenerator(IConfiguration config)
    {
        _secret = config["Jwt:Secret"]!;
        _issuer = config["Jwt:Issuer"]!;
        _audience = config["Jwt:Audience"]!;
        _expiryMinutes = int.Parse(config["Jwt:ExpiryMinutes"] ?? "120");
    }

    public string GenerateToken(User user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.Role),
        };

        // only add this claim when it actually exists, reading it back with
        // User.FindFirst("TeamMemberId") returns null instead of throwing when
        // a login has no TeamMember attached
        if (user.TeamMemberId is not null)
            claims.Add(new Claim("TeamMemberId", user.TeamMemberId.Value.ToString()));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_expiryMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
