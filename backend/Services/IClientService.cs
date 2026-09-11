using System.Security.Claims;
using IDS_API_Project.Common;
using IDS_API_Project.Dtos;
using IDS_API_Project.Models;
// ImplicitUsings pulls in a global "using System;", which makes the bare name
// Environment ambiguous with System.Environment, this alias is the fix
using Environment = IDS_API_Project.Models.Environment;

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

    // environments live under a deployment, but the permission check is the
    // same "assigned to this client, or admin" rule everything else here uses,
    // so clientId still comes in on every call
    Task<Result<Environment>> AddEnvironment(int clientId, int deploymentId, Environment environment, ClaimsPrincipal actingUser);
    Task<Result<Environment>> UpdateEnvironment(int clientId, int environmentId, Environment environment, ClaimsPrincipal actingUser);
    Task<Result<bool>> DeleteEnvironment(int clientId, int environmentId, ClaimsPrincipal actingUser);
}