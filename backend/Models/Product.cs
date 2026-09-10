namespace IDS_API_Project.Models;

/* SupportedMarkets and Technologies are stored as a comma separated string in
   the Products table, but the frontend works with them as string[], so the
   repository splits/joins these when it maps rows, the model here already
   looks like what the frontend expects */

public record Product(
    int Id,
    string Name,
    string Description,
    string BusinessPurpose,
    string LifecycleStatus,
    string CurrentVersion,
    List<string> SupportedMarkets,
    string Criticality,
    List<string> Technologies,
    string? Notes
);
