using IDS_API_Project.Dtos;
using IDS_API_Project.Models;

namespace IDS_API_Project.Repositories;

public interface IClientRepository
{
    Task<List<Client>> GetAll(string? companyName, string? country, int? productId);
    Task<ClientDetails?> GetDetails(int id);
    Task<Client> Create(Client client);
    Task<Client?> Update(int id, Client client);
    Task<bool> Delete(int id);
    Task<Deployment> AddDeployment(int clientId, Deployment deployment);
    Task EnableModule(int deploymentId, int moduleId);
    Task DisableModule(int deploymentId, int moduleId);

    // same idea as IProductRepository.IsTeamMemberAssigned, but through
    // ClientResponsibility instead of ProductResponsibility
    Task<bool> IsTeamMemberAssigned(int clientId, int teamMemberId);
}
