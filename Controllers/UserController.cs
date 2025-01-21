using Microsoft.AspNetCore.Mvc;
using CSBlog.Data;
using CSBlog.Models;
using Bcrypt.Next;

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


}
