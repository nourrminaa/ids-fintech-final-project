using IDS_API_Project.Dtos;
using IDS_API_Project.Repositories;

namespace IDS_API_Project.Services;

public class DeploymentService : IDeploymentService
{
    private readonly IDeploymentRepository _repo;

    public DeploymentService(IDeploymentRepository repo)
    {
        _repo = repo;
    }

    public Task<List<DeploymentListItem>> GetAll(int? productId, int? clientId, string? status) =>
        _repo.GetAll(productId, clientId, status);
}
