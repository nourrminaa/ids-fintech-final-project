namespace IDS_API_Project.Models;

/* the ERD calls this entity "Repository" which would make its repository-pattern
   class RepositoryRepository, that reads badly and is confusing next to the
   actual Repositories/ folder, so the model is named RepositoryLink here instead,
   it is still just a link to a product's GitHub repo, same fields as the ERD */

public record RepositoryLink(int Id, int ProductId, string Name, string GitHubUrl, string MainBranch, string? Description);
