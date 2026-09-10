using IDS_API_Project.Models;

namespace IDS_API_Project.Dtos;

/* everything the Product Details page needs in one response, built from one
   QueryMultiple call in ProductRepository.GetDetails instead of five separate
   GetById style calls, see the architecture notes for why this matters */
public record ProductDetails(
    Product Product,
    List<Module> Modules,
    List<Client> ClientsUsingProduct,
    List<ProductResponsibilityView> ResponsibleTeam,
    List<RepositoryLink> Repositories,
    List<ProductDocument> Documents,
    bool CanEdit
);
