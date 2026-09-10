namespace IDS_API_Project.Models;

// the Client <-> Product join, this is what gets created when you "assign a
// product" to a client, it carries its own version/status/support tier
public record Deployment(
    int Id,
    int ClientId,
    int ProductId,
    string ProductVersion,
    DateTime? GoLiveDate,
    string DeploymentStatus,
    string SupportTier,
    string? ClientSpecificNotes
);
