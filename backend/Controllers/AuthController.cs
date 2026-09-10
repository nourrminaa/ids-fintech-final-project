using IDS_API_Project.Dtos;
using IDS_API_Project.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IDS_API_Project.Controllers;

[ApiController]
[Route("api/auth")]
[AllowAnonymous] // this is the one controller that has to work before a token exists
public class AuthController : ControllerBase
{
    private readonly IAuthService _service;

    public AuthController(IAuthService service)
    {
        _service = service;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var result = await _service.Login(request.Email, request.Password);
        if (!result.Success)
            return Unauthorized(new { message = result.Error }); // 401

        return Ok(result.Value); // 200 + token
    }
}
