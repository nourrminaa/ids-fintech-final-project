using System.Security.Claims;
using IDS_API_Project.Common;
using IDS_API_Project.Dtos;
using IDS_API_Project.Models;
using IDS_API_Project.Repositories;
using IDS_API_Project.Security;

namespace IDS_API_Project.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _repo;

    public ProductService(IProductRepository repo)
    {
        _repo = repo;
    }

    public Task<List<Product>> GetAll(string? name, string? lifecycleStatus, string? technology) =>
        _repo.GetAll(name, lifecycleStatus, technology);

    public async Task<ProductDetails?> GetDetails(int id, ClaimsPrincipal actingUser)
    {
        var details = await _repo.GetDetails(id);
        if (details is null) return null;

        var canEdit = await CanEdit(id, actingUser);
        return details with { CanEdit = canEdit };
    }

    public Task<Product> Create(Product product) => _repo.Create(product);

    public async Task<Result<Product>> Update(int id, Product product, ClaimsPrincipal actingUser)
    {
        var allowed = await CanEdit(id, actingUser);
        if (!allowed)
            return Result<Product>.Fail("You are not assigned to this product");

        var updated = await _repo.Update(id, product);
        return updated is null ? Result<Product>.Fail("Product not found") : Result<Product>.Ok(updated);
    }

    public async Task<Result<bool>> Delete(int id, ClaimsPrincipal actingUser)
    {
        var allowed = await CanEdit(id, actingUser);
        if (!allowed)
            return Result<bool>.Fail("You are not assigned to this product");

        var deleted = await _repo.Delete(id);
        return deleted ? Result<bool>.Ok(true) : Result<bool>.Fail("Product not found");
    }

    public async Task<Result<Module>> AddModule(int productId, Module module, ClaimsPrincipal actingUser)
    {
        if (!await CanEdit(productId, actingUser))
            return Result<Module>.Fail("You are not assigned to this product");

        var created = await _repo.AddModule(productId, module);
        return Result<Module>.Ok(created);
    }

    public async Task<Result<bool>> DeleteModule(int moduleId, ClaimsPrincipal actingUser)
    {
        var productId = await _repo.GetProductIdForModule(moduleId);
        if (productId is null)
            return Result<bool>.Fail("Not found");

        if (!await CanEdit(productId.Value, actingUser))
            return Result<bool>.Fail("You are not assigned to this product");

        var deleted = await _repo.DeleteModule(moduleId);
        return deleted ? Result<bool>.Ok(true) : Result<bool>.Fail("Not found");
    }

    public async Task<Result<ProductResponsibilityView>> AddResponsibility(int productId, int teamMemberId, string responsibility, string? description, ClaimsPrincipal actingUser)
    {
        if (!await CanEdit(productId, actingUser))
            return Result<ProductResponsibilityView>.Fail("You are not assigned to this product");

        var created = await _repo.AddResponsibility(productId, teamMemberId, responsibility, description);
        return Result<ProductResponsibilityView>.Ok(created);
    }

    public async Task<Result<bool>> DeleteResponsibility(int productId, int responsibilityId, ClaimsPrincipal actingUser)
    {
        if (!await CanEdit(productId, actingUser))
            return Result<bool>.Fail("You are not assigned to this product");

        var deleted = await _repo.DeleteResponsibility(productId, responsibilityId);
        return deleted ? Result<bool>.Ok(true) : Result<bool>.Fail("Not found");
    }

    public async Task<Result<RepositoryLink>> AddRepository(int productId, RepositoryLink repository, ClaimsPrincipal actingUser)
    {
        if (!await CanEdit(productId, actingUser))
            return Result<RepositoryLink>.Fail("You are not assigned to this product");

        var created = await _repo.AddRepository(productId, repository);
        return Result<RepositoryLink>.Ok(created);
    }

    public async Task<Result<bool>> DeleteRepository(int productId, int repositoryId, ClaimsPrincipal actingUser)
    {
        if (!await CanEdit(productId, actingUser))
            return Result<bool>.Fail("You are not assigned to this product");

        var deleted = await _repo.DeleteRepository(productId, repositoryId);
        return deleted ? Result<bool>.Ok(true) : Result<bool>.Fail("Not found");
    }

    public async Task<Result<ProductDocument>> AddDocument(int productId, ProductDocument document, ClaimsPrincipal actingUser)
    {
        if (!await CanEdit(productId, actingUser))
            return Result<ProductDocument>.Fail("You are not assigned to this product");

        var created = await _repo.AddDocument(productId, document);
        return Result<ProductDocument>.Ok(created);
    }

    public async Task<Result<bool>> DeleteDocument(int productId, int documentId, ClaimsPrincipal actingUser)
    {
        if (!await CanEdit(productId, actingUser))
            return Result<bool>.Fail("You are not assigned to this product");

        var deleted = await _repo.DeleteDocument(productId, documentId);
        return deleted ? Result<bool>.Ok(true) : Result<bool>.Fail("Not found");
    }

    // admin can touch anything, an employee needs to actually be assigned to
    // this specific product through ProductResponsibility first
    private async Task<bool> CanEdit(int productId, ClaimsPrincipal actingUser)
    {
        if (PermissionChecker.IsAdmin(actingUser))
            return true;

        var teamMemberId = PermissionChecker.GetTeamMemberId(actingUser);
        if (teamMemberId is null)
            return false;

        return await _repo.IsTeamMemberAssigned(productId, teamMemberId.Value);
    }
}