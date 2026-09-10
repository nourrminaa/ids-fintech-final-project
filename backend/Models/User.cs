namespace IDS_API_Project.Models;

/* a login account for the portal, PasswordHash is exactly what it sounds like,
   never store or log the plain password anywhere, TeamMemberId is nullable on
   purpose since a login can exist without being tied to an employee record */

public record User(int Id, string Email, string PasswordHash, string Role, bool IsActive, int? TeamMemberId);
