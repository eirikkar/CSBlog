using CSBlog.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CSblog.Controller;

/// <summary>
/// Controller for handling image upload and deletion.
/// </summary>
[ApiController]
[Route("api/[Controller]")]
public class ImageController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    /// <summary>
    /// Initializes a new instance of the <see cref="ImageController"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    /// <param name="env">The web host environment.</param>
    public ImageController(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    /// <summary>
    /// Uploads an image file.
    /// </summary>
    /// <param name="file">The image file to upload.</param>
    /// <returns>An action result containing the file name of the uploaded image.</returns>
    [Authorize(Policy = "Admin")]
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

        // Save the file to the server
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return Ok(new { fileName });
    }

    /// <summary>
    /// Deletes an image file.
    /// </summary>
    /// <param name="fileName">The name of the file to delete.</param>
    /// <returns>An action result indicating the outcome of the delete operation.</returns>
    [Authorize(Policy = "Admin")]
    [HttpDelete("{fileName}")]
    public IActionResult Delete(string fileName)
    {
        var uploadsPath = Path.Combine(_env.ContentRootPath, "Uploads");
        var filePath = Path.Combine(uploadsPath, fileName);

        if (!System.IO.File.Exists(filePath))
            return NoContent();

        try
        {
            System.IO.File.Delete(filePath);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error deleting file: {ex.Message}");
        }
        return NoContent();
    }
}
