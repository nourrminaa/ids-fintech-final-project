namespace IDS_API_Project.Models;

// junction, which TeamMember does what on which Product, read only for now,
// there is no "assign someone to a product" UI yet, just seeded data
public record ProductResponsibility(int Id, int ProductId, int TeamMemberId, string Responsibility, string? Description);
