using IDS_API_Project.Common;
using IDS_API_Project.Dtos;

namespace IDS_API_Project.Services;

public interface IAuthService
{
    Task<Result<LoginResponse>> Login(string email, string password);
}
