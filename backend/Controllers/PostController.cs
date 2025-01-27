using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CSBlog.Data;
using CSBlog.Models;
using Microsoft.AspNetCore.Authorization;
using Ganss.Xss;

namespace CSBlog.Controllers;
[ApiController]
[Route("api/posts")]
public class PostController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly HtmlSanitizer _htmlSanitizer;

    public PostController(AppDbContext context)
    {
        _context = context;
        _htmlSanitizer = new HtmlSanitizer();
    }

    [HttpGet]
    public async Task<IActionResult> GetPosts()
    {
        var posts = await _context.Posts.ToListAsync();
        if (posts == null)
        {
            return NotFound();
        }
        return Ok(posts);
    }

    [HttpGet("{id}", Name = "GetPostById")]
    public async Task<IActionResult> GetPostById(Guid id)
    {
        var post = await _context.Posts.FindAsync(id);
        if (post == null)
        {
            return NotFound();
        }
        return Ok(post);
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchPosts([FromQuery] string? keyword)
    {
        if (string.IsNullOrEmpty(keyword))
        {
            return BadRequest("Keyword cannot be null or empty.");
        }

        var posts = await _context.Posts
            .Where(p => (p.Title ?? string.Empty).Contains(keyword) || (p.Content ?? string.Empty).Contains(keyword))
            .ToListAsync();

        if (posts == null || posts.Count == 0)
        {
            return NotFound();
        }

        return Ok(posts);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Post(PostModel post)
    {
        post.CreatedAt = DateTime.Now;
        post.UpdatedAt = DateTime.Now;
        if (post.Title == null || post.Content == null)
        {
            return BadRequest();
        }
        post.Title = _htmlSanitizer.Sanitize(post.Title);
        post.Content = _htmlSanitizer.Sanitize(post.Content);
        await _context.Posts.AddAsync(post);
        await _context.SaveChangesAsync();
        return CreatedAtRoute("GetPostById", new { id = post.Id }, post);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> EditPost(Guid id, PostModel post)
    {
        var existingPost = await _context.Posts.FindAsync(id);
        if (existingPost == null)
        {
            return NotFound();
        }
        if (post.Title == null || post.Content == null)
        {
            return BadRequest();
        }
        existingPost.Title = _htmlSanitizer.Sanitize(post.Title);
        existingPost.Content = _htmlSanitizer.Sanitize(post.Content);
        existingPost.UpdatedAt = DateTime.Now;
        _context.Posts.Update(existingPost);
        await _context.SaveChangesAsync();
        return Ok(existingPost);
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePost(Guid id)
    {
        var post = await _context.Posts.FindAsync(id);
        if (post == null)
        {
            return NotFound();
        }
        _context.Posts.Remove(post);
        await _context.SaveChangesAsync();
        return Ok(post);
    }
}
