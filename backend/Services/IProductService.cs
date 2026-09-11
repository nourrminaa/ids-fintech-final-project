using System.Security.Claims;
using IDS_API_Project.Common;
using IDS_API_Project.Dtos;
using IDS_API_Project.Models;

namespace IDS_API_Project.Services;

public interface IProductService
{
    Task<List<Product>> GetAll(string? name, string? lifecycleStatus, string? technology);
    Task<ProductDetails?> GetDetails(int id, ClaimsPrincipal actingUser);
    Task<Product> Create(Product product);
    Task<Result<Product>> Update(int id, Product product, ClaimsPrincipal actingUser);
    Task<Result<bool>> Delete(int id, ClaimsPrincipal actingUser);
    Task<Result<Module>> AddModule(int productId, Module module, ClaimsPrincipal actingUser);
    Task<Result<bool>> DeleteModule(int moduleId, ClaimsPrincipal actingUser);

    Task<Result<ProductResponsibilityView>> AddResponsibility(int productId, int teamMemberId, string responsibility, string? description, ClaimsPrincipal actingUser);
    Task<Result<bool>> DeleteResponsibility(int productId, int responsibilityId, ClaimsPrincipal actingUser);
    Task<Result<RepositoryLink>> AddRepository(int productId, RepositoryLink repository, ClaimsPrincipal actingUser);
    Task<Result<bool>> DeleteRepository(int productId, int repositoryId, ClaimsPrincipal actingUser);
    Task<Result<ProductDocument>> AddDocument(int productId, ProductDocument document, ClaimsPrincipal actingUser);
    Task<Result<bool>> DeleteDocument(int productId, int documentId, ClaimsPrincipal actingUser);
}