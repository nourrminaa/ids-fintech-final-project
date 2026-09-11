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

    // both now confirm the deployment actually belongs to clientId before
    // touching DeploymentModules, and report back whether it did, so the
    // service can tell "not your deployment" apart from "already toggled"
    Task<bool> EnableModule(int clientId, int deploymentId, int moduleId);
    Task<bool> DisableModule(int clientId, int deploymentId, int moduleId);

    // full CRUD for environments, one deployment can have several, these sit
    // under a deployment the same way DeploymentModule sits under one.
    // clientId is threaded through everywhere now so an environment can only
    // ever be reached through its own client's deployment
    Task<Environment?> AddEnvironment(int clientId, int deploymentId, Environment environment);
    Task<Environment?> UpdateEnvironment(int clientId, int environmentId, Environment environment);
    Task<bool> DeleteEnvironment(int clientId, int environmentId);

    // same idea as IProductRepository.IsTeamMemberAssigned, but through
    // ClientResponsibility instead of ProductResponsibility
    Task<bool> IsTeamMemberAssigned(int clientId, int teamMemberId);
    Task<ClientResponsibilityView> AddResponsibility(int clientId, int teamMemberId, string responsibility, string? description);
    Task<bool> DeleteResponsibility(int clientId, int responsibilityId);
}