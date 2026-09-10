using System.Security.Claims;
using IDS_API_Project.Common;
using IDS_API_Project.Dtos;
using IDS_API_Project.Models;

namespace IDS_API_Project.Services;

public interface IClientService
{
    Task<List<Client>> GetAll(string? companyName, string? country, int? productId);
    Task<ClientDetails?> GetDetails(int id);
    Task<Client> Create(Client client);
    Task<Result<Client>> Update(int id, Client client, ClaimsPrincipal actingUser);
    Task<Result<bool>> Delete(int id, ClaimsPrincipal actingUser);
    Task<Result<Deployment>> AddDeployment(int clientId, Deployment deployment, ClaimsPrincipal actingUser);
    Task<Result<bool>> EnableModule(int clientId, int deploymentId, int moduleId, ClaimsPrincipal actingUser);
    Task<Result<bool>> DisableModule(int clientId, int deploymentId, int moduleId, ClaimsPrincipal actingUser);
}
