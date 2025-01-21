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
    public IEnumerable<PostModel> Get()
    {
        return _context.Posts.ToList();
    }
}
