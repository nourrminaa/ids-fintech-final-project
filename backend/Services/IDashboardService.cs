using IDS_API_Project.Dtos;

namespace IDS_API_Project.Services;

public interface IDashboardService
{
    Task<DashboardSummary> GetSummary();
}
