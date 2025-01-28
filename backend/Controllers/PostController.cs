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
    private readonly IWebHostEnvironment _env;

    public PostController(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _htmlSanitizer = new HtmlSanitizer();
        _env = env;

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

        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        return Ok(new
        {
            post.Id,
            post.Title,
            post.Content,
            ImageUrl = !string.IsNullOrEmpty(post.ImageUrl)
                ? $"{baseUrl}/uploads/{post.ImageUrl}"
                : null,
            post.CreatedAt,
            post.UpdatedAt
        });
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

    [Authorize(Policy = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Post([FromBody] PostModel postInput)
    {
        if (postInput.Title == null || postInput.Content == null)
        {
            return BadRequest();
        }
        var post = new PostModel
        {
            Title = _htmlSanitizer.Sanitize(postInput.Title),
            Content = _htmlSanitizer.Sanitize(postInput.Content),
            CreatedAt = DateTime.Now,
            UpdatedAt = DateTime.Now,
            ImageUrl = postInput.ImageUrl
        };
        await _context.Posts.AddAsync(post);
        await _context.SaveChangesAsync();
        return CreatedAtRoute("GetPostById", new { id = post.Id }, post);
    }

    [Authorize(Policy = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> EditPost(Guid id, [FromBody] PostModel post)
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
        existingPost.ImageUrl = post.ImageUrl;
        _context.Posts.Update(existingPost);
        await _context.SaveChangesAsync();
        return Ok(existingPost);
    }

    [Authorize(Policy = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePost(Guid id)
    {
        var post = await _context.Posts.FindAsync(id);
        if (post == null)
        {
            return NotFound();
        }

        // Delete associated image
        if (!string.IsNullOrEmpty(post.ImageUrl))
        {
            var imagePath = Path.Combine(_env.ContentRootPath, "Uploads", post.ImageUrl);
            if (System.IO.File.Exists(imagePath))
            {
                System.IO.File.Delete(imagePath);
            }
        }

        _context.Posts.Remove(post);
        await _context.SaveChangesAsync();
        return Ok(post);
    }
}
