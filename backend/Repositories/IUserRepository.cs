using IDS_API_Project.Models;

namespace IDS_API_Project.Repositories;

public interface IUserRepository
{
    Task<User?> GetByEmail(string email);
    Task<User?> GetById(int id);
    Task<List<User>> GetAll();
    Task<User> Create(User user);
    Task<User?> UpdateRoleAndStatus(int id, string? role, bool? isActive, int? teamMemberId);
}
