namespace IDS_API_Project.Dtos;

// an Environment shown alongside the Deployment it belongs to, used inside
// ClientDetails so the client details page can render each deployment's
// environments without a second lookup
public record EnvironmentSummary(
    int Id,
    string EnvironmentName,
    string EnvironmentType,
    string? Purpose,
    string? ServerName,
    string? OperatingSystem,
    string? ApplicationUrl,
    string? DatabaseInfo,
    string? MonitoringLink,
    string? AccessInstructions,
    string? Notes
);
