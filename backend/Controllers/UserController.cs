using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CSBlog.Data;
using CSBlog.Models;
using Microsoft.AspNetCore.Authorization;

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

    [HttpGet("{id}", Name = "GetUserById")]
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
        if (await _context.Users.AnyAsync(u => u.Username == user.Username))
        {
            return BadRequest("Username already exists");
        }
        await _context.SaveChangesAsync();
        return CreatedAtRoute("GetUserById", new { id = user.Id }, user);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> EditUser(UserModel user, Guid id)
    {
        var existingUser = await _context.Users.FindAsync(id);
        if (existingUser == null)
        {
            return NotFound();
        }

        existingUser.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
        existingUser.Username = user.Username;
        existingUser.Email = user.Email;
        _context.Users.Update(existingUser);
        await _context.SaveChangesAsync();
        return Ok(existingUser);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteUser(Guid id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound();
        }
        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return Ok($"User with id {id} has been deleted");
    }

    [HttpPost("login")]
    public async Task<ActionResult> Login(UserModel user)
    {
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Username == user.Username);
        if (existingUser == null)
        {
            return NotFound();
        }
        if (!BCrypt.Net.BCrypt.Verify(user.Password, existingUser.Password))
        {
            return Unauthorized();
        }
        return Ok(existingUser);
    }


}
