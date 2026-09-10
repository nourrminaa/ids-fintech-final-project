using IDS_API_Project.Dtos;

namespace IDS_API_Project.Repositories;

// this is only for the flat /deployments list page, creating a deployment
// still goes through IClientRepository.AddDeployment since that is where the
// frontend's "Assign Product" dialog lives
public interface IDeploymentRepository
{
    Task<List<DeploymentListItem>> GetAll(int? productId, int? clientId, string? status);
}
