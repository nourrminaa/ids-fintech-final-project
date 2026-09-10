using IDS_API_Project.Models;
using IDS_API_Project.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IDS_API_Project.Controllers;

// reads are open to any logged in user, same as before, writes are admin
// only, applied per action here since the class level [Authorize] alone
// would let any Employee create or delete a team member otherwise
[ApiController]
[Route("api/teammembers")]
[Authorize]
public class TeamMembersController : ControllerBase
{
    private readonly ITeamMemberService _service;

    public TeamMembersController(ITeamMemberService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? fullName, [FromQuery] string? department)
    {
        var members = await _service.GetAll(fullName, department);
        return Ok(members);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Create(TeamMember member)
    {
        var created = await _service.Create(member);
        return Ok(created);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(int id, TeamMember member)
    {
        var updated = await _service.Update(id, member);
        if (updated is null)
            return NotFound();

        return Ok(updated);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.Delete(id);
        if (!deleted)
            return NotFound();

        return NoContent();
    }
}
