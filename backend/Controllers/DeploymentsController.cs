using IDS_API_Project.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IDS_API_Project.Controllers;

// read only flat list, for the /deployments page, creating a deployment is
// done from ClientsController since that mirrors the frontend's "Assign
// Product" dialog living on the client details page, not its own page
[ApiController]
[Route("api/deployments")]
[Authorize]
public class DeploymentsController : ControllerBase
{
    private readonly IDeploymentService _service;

    public DeploymentsController(IDeploymentService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? productId, [FromQuery] int? clientId, [FromQuery] string? status)
    {
        var deployments = await _service.GetAll(productId, clientId, status);
        return Ok(deployments);
    }
}
