using IDS_API_Project.Common;
using IDS_API_Project.Dtos;

namespace IDS_API_Project.Services;

public interface IUserService
{
    Task<List<UserResponse>> GetAll();
    Task<Result<UserResponse>> Create(CreateUserRequest request);
    Task<Result<UserResponse>> UpdateRoleAndStatus(int id, UpdateUserRequest request);
}
