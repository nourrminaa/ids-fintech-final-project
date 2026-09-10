using IDS_API_Project.Dtos;

namespace IDS_API_Project.Services;

public interface IDeploymentService
{
    Task<List<DeploymentListItem>> GetAll(int? productId, int? clientId, string? status);
}
