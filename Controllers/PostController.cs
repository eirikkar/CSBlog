using Microsoft.AspNetCore.Mvc;
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
    [Authorize]
    [HttpPost]
    public IActionResult Post(PostModel post)
    {
        post.CreatedAt = DateTime.Now;
        post.UpdatedAt = DateTime.Now;
        _context.Posts.Add(post);
        _context.SaveChanges();
        return CreatedAtRoute("GetPost", new { Guid = post.Id }, post);
    }

    [Authorize]
    [HttpPut("{id}")]
    public IActionResult Put(Guid id, PostModel post)
    {
        var existingPost = _context.Posts.Find(id);
        if (existingPost == null)
        {
            return NotFound();
        }
        existingPost.Title = post.Title;
        existingPost.Content = post.Content;
        existingPost.UpdatedAt = DateTime.Now;
        _context.Posts.Update(existingPost);
        _context.SaveChanges();
        return Ok(existingPost);
    }

    [Authorize]
    [HttpDelete("{id}")]
    public IActionResult Delete(Guid id)
    {
        var post = _context.Posts.Find(id);
        if (post == null)
        {
            return NotFound();
        }
        _context.Posts.Remove(post);
        _context.SaveChanges();
        return Ok($"Post with id {id} has been deleted");
    }
}
