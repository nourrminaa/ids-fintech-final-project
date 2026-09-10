namespace IDS_API_Project.Models;

// a functional piece of a Product, e.g. "Payments Core" or "Fraud Detection"
public record Module(int Id, int ProductId, string Name, string? Description, string Status);
