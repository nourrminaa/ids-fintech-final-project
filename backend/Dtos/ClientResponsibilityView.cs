namespace IDS_API_Project.Dtos;

// same idea as ProductResponsibilityView but for ClientResponsibility
public record ClientResponsibilityView(int Id, int ClientId, int TeamMemberId, string TeamMemberName, string Responsibility, string? Description);
