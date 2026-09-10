using IDS_API_Project.Dtos;
using IDS_API_Project.Models;
using IDS_API_Project.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IDS_API_Project.Controllers;

[ApiController]
[Route("api/products")]
[Authorize] // any logged in user can view, Update/Delete check assignment inside the service
public class ProductsController : ControllerBase
{
    private readonly IProductService _service;

    public ProductsController(IProductService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? name, [FromQuery] string? lifecycleStatus, [FromQuery] string? technology)
    {
        var products = await _service.GetAll(name, lifecycleStatus, technology);
        return Ok(products);
    }

    // returns the full Product Details page payload in one call, see
    // ProductRepository.GetDetails for the actual query
    [HttpGet("{id}")]
    public async Task<IActionResult> GetDetails(int id)
    {
        var details = await _service.GetDetails(id, User);
        if (details is null)
            return NotFound();

        return Ok(details);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Product product)
    {
        var created = await _service.Create(product);
        return CreatedAtAction(nameof(GetDetails), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Product product)
    {
        var result = await _service.Update(id, product, User);
        if (!result.Success)
            return Forbid(); // covers both "not found" and "not assigned", no need to tell the caller which

        return Ok(result.Value);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _service.Delete(id, User);
        if (!result.Success)
            return Forbid();

        return NoContent(); // 204
    }

    [HttpPost("{id}/modules")]
    public async Task<IActionResult> AddModule(int id, Module module)
    {
        var created = await _service.AddModule(id, module);
        return Ok(created);
    }

    [HttpDelete("modules/{moduleId}")]
    public async Task<IActionResult> DeleteModule(int moduleId)
    {
        var deleted = await _service.DeleteModule(moduleId);
        if (!deleted)
            return NotFound();

        return NoContent();
    }

    // Responsible Team, gated the same way as editing the product itself,
    // admin or a team member already assigned to this product
    [HttpPost("{id}/responsibilities")]
    public async Task<IActionResult> AddResponsibility(int id, CreateResponsibilityRequest request)
    {
        var result = await _service.AddResponsibility(id, request.TeamMemberId, request.Responsibility, request.Description, User);
        if (!result.Success)
            return Forbid();

        return Ok(result.Value);
    }

    [HttpDelete("{id}/responsibilities/{responsibilityId}")]
    public async Task<IActionResult> DeleteResponsibility(int id, int responsibilityId)
    {
        var result = await _service.DeleteResponsibility(id, responsibilityId, User);
        if (!result.Success)
            return Forbid();

        return NoContent();
    }

    // Repositories
    [HttpPost("{id}/repositories")]
    public async Task<IActionResult> AddRepository(int id, RepositoryLink repository)
    {
        var result = await _service.AddRepository(id, repository, User);
        if (!result.Success)
            return Forbid();

        return Ok(result.Value);
    }

    [HttpDelete("{id}/repositories/{repositoryId}")]
    public async Task<IActionResult> DeleteRepository(int id, int repositoryId)
    {
        var result = await _service.DeleteRepository(id, repositoryId, User);
        if (!result.Success)
            return Forbid();

        return NoContent();
    }

    // Documentation
    [HttpPost("{id}/documents")]
    public async Task<IActionResult> AddDocument(int id, ProductDocument document)
    {
        var result = await _service.AddDocument(id, document, User);
        if (!result.Success)
            return Forbid();

        return Ok(result.Value);
    }

    [HttpDelete("{id}/documents/{documentId}")]
    public async Task<IActionResult> DeleteDocument(int id, int documentId)
    {
        var result = await _service.DeleteDocument(id, documentId, User);
        if (!result.Success)
            return Forbid();

        return NoContent();
    }
}
