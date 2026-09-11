using System.Security.Claims;
using IDS_API_Project.Common;
using IDS_API_Project.Dtos;
using IDS_API_Project.Models;
using IDS_API_Project.Repositories;
using IDS_API_Project.Security;
// ImplicitUsings pulls in a global "using System;", which makes the bare name
// Environment ambiguous with System.Environment, this alias is the fix
using Environment = IDS_API_Project.Models.Environment;

namespace IDS_API_Project.Services;

public class ClientService : IClientService
{
    private readonly IClientRepository _repo;

    public ClientService(IClientRepository repo)
    {
        _repo = repo;
    }

    public Task<List<Client>> GetAll(string? companyName, string? country, int? productId) =>
        _repo.GetAll(companyName, country, productId);

    public async Task<ClientDetails?> GetDetails(int id, ClaimsPrincipal actingUser)
    {
        var details = await _repo.GetDetails(id);
        if (details is null) return null;

        var canEdit = await CanEdit(id, actingUser);
        return details with { CanEdit = canEdit };
    }

    public Task<Client> Create(Client client) => _repo.Create(client);

    public async Task<Result<Client>> Update(int id, Client client, ClaimsPrincipal actingUser)
    {
        if (!await CanEdit(id, actingUser))
            return Result<Client>.Fail("You are not assigned to this client");

        var updated = await _repo.Update(id, client);
        return updated is null ? Result<Client>.Fail("Client not found") : Result<Client>.Ok(updated);
    }

    public async Task<Result<bool>> Delete(int id, ClaimsPrincipal actingUser)
    {
        if (!await CanEdit(id, actingUser))
            return Result<bool>.Fail("You are not assigned to this client");

        var deleted = await _repo.Delete(id);
        return deleted ? Result<bool>.Ok(true) : Result<bool>.Fail("Client not found");
    }

    // assigning a product to a client is a write against that client, so it
    // goes through the same assigned-or-admin check as editing the client itself
    public async Task<Result<Deployment>> AddDeployment(int clientId, Deployment deployment, ClaimsPrincipal actingUser)
    {
        if (!await CanEdit(clientId, actingUser))
            return Result<Deployment>.Fail("You are not assigned to this client");

        var created = await _repo.AddDeployment(clientId, deployment);
        return Result<Deployment>.Ok(created);
    }

    public async Task<Result<bool>> EnableModule(int clientId, int deploymentId, int moduleId, ClaimsPrincipal actingUser)
    {
        if (!await CanEdit(clientId, actingUser))
            return Result<bool>.Fail("You are not assigned to this client");

        await _repo.EnableModule(deploymentId, moduleId);
        return Result<bool>.Ok(true);
    }

    public async Task<Result<bool>> DisableModule(int clientId, int deploymentId, int moduleId, ClaimsPrincipal actingUser)
    {
        if (!await CanEdit(clientId, actingUser))
            return Result<bool>.Fail("You are not assigned to this client");

        await _repo.DisableModule(deploymentId, moduleId);
        return Result<bool>.Ok(true);
    }

    public async Task<Result<Environment>> AddEnvironment(int clientId, int deploymentId, Environment environment, ClaimsPrincipal actingUser)
    {
        if (!await CanEdit(clientId, actingUser))
            return Result<Environment>.Fail("You are not assigned to this client");

        var created = await _repo.AddEnvironment(deploymentId, environment);
        return Result<Environment>.Ok(created);
    }

    public async Task<Result<Environment>> UpdateEnvironment(int clientId, int environmentId, Environment environment, ClaimsPrincipal actingUser)
    {
        if (!await CanEdit(clientId, actingUser))
            return Result<Environment>.Fail("You are not assigned to this client");

        var updated = await _repo.UpdateEnvironment(environmentId, environment);
        return updated is null ? Result<Environment>.Fail("Environment not found") : Result<Environment>.Ok(updated);
    }

    public async Task<Result<bool>> DeleteEnvironment(int clientId, int environmentId, ClaimsPrincipal actingUser)
    {
        if (!await CanEdit(clientId, actingUser))
            return Result<bool>.Fail("You are not assigned to this client");

        var deleted = await _repo.DeleteEnvironment(environmentId);
        return deleted ? Result<bool>.Ok(true) : Result<bool>.Fail("Environment not found");
    }

    public async Task<Result<ClientResponsibilityView>> AddResponsibility(int clientId, int teamMemberId, string responsibility, string? description, ClaimsPrincipal actingUser)
    {
        if (!await CanEdit(clientId, actingUser))
            return Result<ClientResponsibilityView>.Fail("You are not assigned to this client");

        var created = await _repo.AddResponsibility(clientId, teamMemberId, responsibility, description);
        return Result<ClientResponsibilityView>.Ok(created);
    }

    public async Task<Result<bool>> DeleteResponsibility(int clientId, int responsibilityId, ClaimsPrincipal actingUser)
    {
        if (!await CanEdit(clientId, actingUser))
            return Result<bool>.Fail("You are not assigned to this client");

        var deleted = await _repo.DeleteResponsibility(responsibilityId);
        return deleted ? Result<bool>.Ok(true) : Result<bool>.Fail("Not found");
    }

    private async Task<bool> CanEdit(int clientId, ClaimsPrincipal actingUser)
    {
        if (PermissionChecker.IsAdmin(actingUser))
            return true;

        var teamMemberId = PermissionChecker.GetTeamMemberId(actingUser);
        if (teamMemberId is null)
            return false;

        return await _repo.IsTeamMemberAssigned(clientId, teamMemberId.Value);
    }
}