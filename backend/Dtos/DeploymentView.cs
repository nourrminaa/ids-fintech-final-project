using IDS_API_Project.Models;

namespace IDS_API_Project.Dtos;

// a Deployment plus its product name, enabled module names and environments,
// this is what shows up as one "card" on the Client Details page
public record DeploymentView(
    int Id,
    int ProductId,
    string ProductName,
    string ProductVersion,
    DateTime? GoLiveDate,
    string DeploymentStatus,
    string SupportTier,
    string? ClientSpecificNotes,
    List<Module> AvailableModules,
    List<int> EnabledModuleIds,
    List<EnvironmentSummary> Environments
);
