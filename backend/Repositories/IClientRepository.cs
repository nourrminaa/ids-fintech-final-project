using IDS_API_Project.Dtos;
using IDS_API_Project.Models;
// ImplicitUsings pulls in a global "using System;", which makes the bare name
// Environment ambiguous with System.Environment, this alias is the fix
using Environment = IDS_API_Project.Models.Environment;

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

    // full CRUD for environments, one deployment can have several, these sit
    // under a deployment the same way DeploymentModule sits under one
    Task<Environment> AddEnvironment(int deploymentId, Environment environment);
    Task<Environment?> UpdateEnvironment(int environmentId, Environment environment);
    Task<bool> DeleteEnvironment(int environmentId);

    // same idea as IProductRepository.IsTeamMemberAssigned, but through
    // ClientResponsibility instead of ProductResponsibility
    Task<bool> IsTeamMemberAssigned(int clientId, int teamMemberId);
}