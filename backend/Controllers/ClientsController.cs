using IDS_API_Project.Models;
using IDS_API_Project.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IDS_API_Project.Controllers;

[ApiController]
[Route("api/clients")]
[Authorize]
public class ClientsController : ControllerBase
{
    private readonly IClientService _service;

    public ClientsController(IClientService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? companyName, [FromQuery] string? country, [FromQuery] int? productId)
    {
        var clients = await _service.GetAll(companyName, country, productId);
        return Ok(clients);
    }

    // full Client Details page payload in one call, deployments already come
    // with their environments and enabled modules attached
    [HttpGet("{id}")]
    public async Task<IActionResult> GetDetails(int id)
    {
        var details = await _service.GetDetails(id);
        if (details is null)
            return NotFound();

        return Ok(details);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Client client)
    {
        var created = await _service.Create(client);
        return CreatedAtAction(nameof(GetDetails), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Client client)
    {
        var result = await _service.Update(id, client, User);
        if (!result.Success)
            return Forbid();

        return Ok(result.Value);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _service.Delete(id, User);
        if (!result.Success)
            return Forbid();

        return NoContent();
    }

    // this is what the frontend's "Assign Product" dialog calls, creates a
    // Deployment row, modules are not set here, they get toggled after, on
    // the deployment card itself, same as the mock version worked
    [HttpPost("{id}/deployments")]
    public async Task<IActionResult> AddDeployment(int id, Deployment deployment)
    {
        var result = await _service.AddDeployment(id, deployment, User);
        if (!result.Success)
            return Forbid();

        return Ok(result.Value);
    }

    [HttpPost("{id}/deployments/{deploymentId}/modules/{moduleId}")]
    public async Task<IActionResult> EnableModule(int id, int deploymentId, int moduleId)
    {
        var result = await _service.EnableModule(id, deploymentId, moduleId, User);
        if (!result.Success)
            return Forbid();

        return Ok();
    }

    [HttpDelete("{id}/deployments/{deploymentId}/modules/{moduleId}")]
    public async Task<IActionResult> DisableModule(int id, int deploymentId, int moduleId)
    {
        var result = await _service.DisableModule(id, deploymentId, moduleId, User);
        if (!result.Success)
            return Forbid();

        return Ok();
    }
}
