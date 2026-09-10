namespace IDS_API_Project.Models;

// junction table, which of the product's Modules are switched on for one specific
// Deployment, rows here get added/removed by the toggle endpoint, nothing else
public record DeploymentModule(int Id, int DeploymentId, int ModuleId);
