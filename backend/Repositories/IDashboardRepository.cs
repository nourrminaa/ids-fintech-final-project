using IDS_API_Project.Dtos;

namespace IDS_API_Project.Repositories;

public interface IDashboardRepository
{
    Task<DashboardSummary> GetSummary();
}
