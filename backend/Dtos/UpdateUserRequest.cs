namespace IDS_API_Project.Dtos;

// all three fields are optional since the admin screen can change any one of
// them independently, TeamMemberId lets an admin link or move a login to a
// different employee record after the fact
public record UpdateUserRequest(string? Role, bool? IsActive, int? TeamMemberId);
