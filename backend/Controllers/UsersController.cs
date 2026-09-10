using IDS_API_Project.Dtos;
using IDS_API_Project.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IDS_API_Project.Controllers;

// admin only, matches section 4.1 of the spec, "only an Admin should manage
// users", enforced here server side, not just hidden client side like the
// mock frontend used to do
[ApiController]
[Route("api/users")]
[Authorize(Policy = "AdminOnly")]
public class UsersController : ControllerBase
{
    private readonly IUserService _service;

    public UsersController(IUserService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _service.GetAll();
        return Ok(users);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateUserRequest request)
    {
        var result = await _service.Create(request);
        if (!result.Success)
            return Conflict(new { message = result.Error }); // 409, email already taken

        return Ok(result.Value);
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> UpdateRoleAndStatus(int id, UpdateUserRequest request)
    {
        var result = await _service.UpdateRoleAndStatus(id, request);
        if (!result.Success)
            return NotFound(new { message = result.Error });

        return Ok(result.Value);
    }
}
