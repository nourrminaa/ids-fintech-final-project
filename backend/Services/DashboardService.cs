using IDS_API_Project.Dtos;
using IDS_API_Project.Repositories;

namespace IDS_API_Project.Services;

public class DashboardService : IDashboardService
{
    private readonly IDashboardRepository _repo;

    public DashboardService(IDashboardRepository repo)
    {
        _repo = repo;
    }

    public Task<DashboardSummary> GetSummary() => _repo.GetSummary();
}
