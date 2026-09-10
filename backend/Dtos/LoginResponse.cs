namespace IDS_API_Project.Dtos;

// what the frontend's AuthContext actually needs to build its CurrentUser object,
// see the frontend handoff, this mirrors that shape closely on purpose
public record LoginResponse(string Token, int Id, string Email, string Role, int? TeamMemberId, string FullName);
