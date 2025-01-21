using Microsoft.AspNetCore.Mvc;
using CSBlog.Data;
using CSBlog.Models;
namespace CSBlog.Controllers;

namespace CSBlog.Controllers;
[ApiController]
[Route("api/posts")]
public class PostController : ControllerBase
{
    private readonly AppDbContext _context;

    public PostController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetPosts()
    {
        return Ok(_context.Posts);
    }

    [HttpGet("{id}", Name = "GetPost")]
    public IActionResult GetPost(Guid id)
    {
        var post = _context.Posts.Find(id);
        if (post == null)
        {
            return NotFound();
        }
        return Ok(post);
    }

    [HttpPost]
    public IActionResult Post(PostModel post)
    {
        post.CreatedAt = DateTime.Now;
        post.UpdatedAt = DateTime.Now;
        _context.Posts.Add(post);
        _context.SaveChanges();
        return CreatedAtRoute("GetPost", new { Guid = post.Id }, post);
    }

    [HttpPut("{id}")]
    public IActionResult Put(Guid id, PostModel post)
    {
        if (_context.Posts.Find(id) == null)
        {
            return NotFound();
        }
        post.UpdatedAt = DateTime.Now;
        _context.Posts.Update(post);
        _context.SaveChanges();
        return Ok(post);
    }

}
