using IDS_API_Project.Models;

namespace IDS_API_Project.Services;

public interface ITeamMemberService
{
    Task<List<TeamMember>> GetAll(string? fullName, string? department);
    Task<TeamMember> Create(TeamMember member);
    Task<TeamMember?> Update(int id, TeamMember member);
    Task<bool> Delete(int id);
}
