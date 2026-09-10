namespace IDS_API_Project.Dtos;

// TeamMemberId is optional, a login can exist without being tied to an
// employee record, same as the User model itself allows
public record CreateUserRequest(string Email, string Password, string Role, int? TeamMemberId);
