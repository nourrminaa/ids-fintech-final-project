using IDS_API_Project.Models;
using IDS_API_Project.Repositories;

namespace IDS_API_Project.Services;

// no permission logic in here, writes are gated admin-only at the controller,
// there is no "assigned employee" concept for team members the way there is
// for products and clients
public class TeamMemberService : ITeamMemberService
{
    private readonly ITeamMemberRepository _repo;

    public TeamMemberService(ITeamMemberRepository repo)
    {
        _repo = repo;
    }

    public Task<List<TeamMember>> GetAll(string? fullName, string? department) => _repo.GetAll(fullName, department);

    public Task<TeamMember> Create(TeamMember member) => _repo.Create(member);

    public Task<TeamMember?> Update(int id, TeamMember member) => _repo.Update(id, member);

    public Task<bool> Delete(int id) => _repo.Delete(id);
}
