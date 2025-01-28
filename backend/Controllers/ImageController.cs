using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CSBlog.Data;

namespace CSblog.Controller;

[ApiController]
[Route("api/[Controller]")]
[Authorize(Policy = "Admin")]
public class ImageController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public ImageController(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    [HttpPost("upload")]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("File is required.");
        }
        // Validate file type
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (string.IsNullOrEmpty(extension) || !allowedExtensions.Contains(extension))
            return BadRequest("Invalid file type");

        // Validate file size (5MB limit)
        if (file.Length > 5 * 1024 * 1024)
            return BadRequest("File size exceeds 5MB limit");

        // Create filename
        var fileName = $"{Guid.NewGuid()}{extension}";
        var uploadsPath = Path.Combine(_env.ContentRootPath, "Uploads");

        if (!Directory.Exists(uploadsPath))
            Directory.CreateDirectory(uploadsPath);

        var filePath = Path.Combine(uploadsPath, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return Ok(new { fileName });
    }

    [HttpDelete("{fileName}")]
    public IActionResult Delete(string fileName)
    {
        var uploadsPath = Path.Combine(_env.ContentRootPath, "Uploads");
        var filePath = Path.Combine(uploadsPath, fileName);

        if (!System.IO.File.Exists(filePath))
            return NotFound();

        System.IO.File.Delete(filePath);
        return NoContent();
    }
}
