using IDS_API_Project.Models;

namespace IDS_API_Project.Repositories;

public interface ITeamMemberRepository
{
    Task<List<TeamMember>> GetAll(string? fullName, string? department);
    Task<TeamMember?> GetById(int id);
    Task<TeamMember> Create(TeamMember member);
    Task<TeamMember?> Update(int id, TeamMember member);
    Task<bool> Delete(int id);
}
