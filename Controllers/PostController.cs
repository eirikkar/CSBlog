using Microsoft.AspNetCore.Mvc;
using CSBlog.Data;
using CSBlog.Models;
namespace CSBlog.Controllers;

[ApiController]
[Route("[api/posts]")]
public class PostController : ControllerBase
{
    private readonly AppDbContext _context;

    public PostController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult Get()
    {
        return Ok(_context.Posts);
    }

    [HttpGet("{id}")]
    public IActionResult Get(Guid id)
    {
        if (_context.Posts.Find(id) == null)
        {
            return NotFound();
        }
        return Ok(_context.Posts.Find(id));
    }
}
