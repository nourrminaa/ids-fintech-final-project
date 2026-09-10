namespace IDS_API_Project.Models;

/* named Environment to match the ERD and the frontend's types.ts 1 for 1, if this
   ever needs to sit next to System.Environment in the same file just fully
   qualify the system one, we do not use System.Environment anywhere in this
   project so it has not come up in practice */

public record Environment(
    int Id,
    int DeploymentId,
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
