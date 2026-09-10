using IDS_API_Project.Models;

namespace IDS_API_Project.Dtos;

// same shape as ProductResponsibility, plus the TeamMember's name pulled in
// through a join, so the frontend does not need a second round trip just to
// show "John Smith - Backend Developer" on the Product Details page
public record ProductResponsibilityView(int Id, int ProductId, int TeamMemberId, string TeamMemberName, string Responsibility, string? Description);
