using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CSBlog.Data;
using CSBlog.Models;

namespace UserController;

[ApiController]
[Route("api/users")]
public class UserController : ControllerBase
{
    private readonly AppDbContext _context;

    public UserController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult> GetUsers()
    {
        var users = await _context.Users.ToListAsync();
        if (users == null)
        {
            return NotFound();
        }
        return Ok(users);
    }

    [HttpGet("{id}", Name = "GetUser")]
    public async Task<ActionResult> GetUserById(Guid id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound();
        }
        return Ok(user);
    }

    [HttpPost]
    public async Task<ActionResult> CreateUser(UserModel user)
    {
        user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return CreatedAtRoute("GetUser", new { Guid = user.Id }, user);
    }


}
