using IDS_API_Project.Models;

namespace IDS_API_Project.Dtos;

public record DashboardSummary(
    int TotalProducts,
    int ActiveProducts,
    int TotalClients,
    int TotalDeployments,
    int TotalTeamMembers,
    List<Product> RecentlyUpdatedProducts
);
