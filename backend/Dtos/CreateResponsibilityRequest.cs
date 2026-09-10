namespace IDS_API_Project.Dtos;

// used to assign a TeamMember to a Product's Responsible Team
public record CreateResponsibilityRequest(int TeamMemberId, string Responsibility, string? Description);
