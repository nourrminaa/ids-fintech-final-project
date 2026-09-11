using IDS_API_Project.Dtos;
using IDS_API_Project.Models;

namespace IDS_API_Project.Repositories;

public interface IProductRepository
{
    Task<List<Product>> GetAll(string? name, string? lifecycleStatus, string? technology);
    Task<ProductDetails?> GetDetails(int id);
    Task<Product> Create(Product product);
    Task<Product?> Update(int id, Product product);
    Task<bool> Delete(int id);
    Task<Module> AddModule(int productId, Module module);
    Task<bool> DeleteModule(int moduleId);

    // DeleteModule's route has no {productId}, just {moduleId}, so the service
    // needs this to find out which product a module belongs to before it can
    // run the admin-or-assigned check
    Task<int?> GetProductIdForModule(int moduleId);

    // used by the "admin edits anything, assigned employees edit their own" rule,
    // checks if a TeamMember shows up in ProductResponsibility for this product
    Task<bool> IsTeamMemberAssigned(int productId, int teamMemberId);

    // Responsible Team, Repositories and Documentation are read only for now
    // per the original spec, these give them real CRUD, still gated the same
    // admin-or-assigned way by the service layer. productId is threaded through
    // on every delete now so a row can only ever be deleted through its own product's route
    Task<ProductResponsibilityView> AddResponsibility(int productId, int teamMemberId, string responsibility, string? description);
    Task<bool> DeleteResponsibility(int productId, int responsibilityId);
    Task<RepositoryLink> AddRepository(int productId, RepositoryLink repository);
    Task<bool> DeleteRepository(int productId, int repositoryId);
    Task<ProductDocument> AddDocument(int productId, ProductDocument document);
    Task<bool> DeleteDocument(int productId, int documentId);
}