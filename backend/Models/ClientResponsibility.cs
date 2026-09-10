namespace IDS_API_Project.Models;

// junction, which TeamMember is the contact for which Client, same story as
// ProductResponsibility, read only for now
public record ClientResponsibility(int Id, int ClientId, int TeamMemberId, string Responsibility, string? Description);
