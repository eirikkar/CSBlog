using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CSBlog.Data;
using CSBlog.Models;
using Microsoft.AspNetCore.Authorization;

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

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Post(PostModel post)
    {
        post.CreatedAt = DateTime.Now;
        post.UpdatedAt = DateTime.Now;
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
        existingPost.Title = post.Title;
        existingPost.Content = post.Content;
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
