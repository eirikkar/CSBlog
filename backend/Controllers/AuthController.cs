using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using CSBlog.Models;
using CSBlog.Data;

namespace CSBlog.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public IActionResult Login(UserModel login)
        {
            var user = _context.Users.SingleOrDefault(u => u.Username == login.Username);
            if (user != null && BCrypt.Net.BCrypt.Verify(login.Password, user.Password))
            {
                if (string.IsNullOrEmpty(user.Username))
                {
                    return BadRequest("Username is required.");
                }

                var token = GenerateJwtToken(user);
                return Ok(new { token, role = user.Role.ToString() });
            }
            return Unauthorized();
        }

        [HttpGet("GetUser")]
        public IActionResult GetUser()
        {
            var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            if (string.IsNullOrEmpty(token))
            {
                return BadRequest("Token is required.");
            }

            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);
            var username = jwtToken.Subject;

            var user = _context.Users.SingleOrDefault(u => u.Username == username);
            if (user == null)
            {
                return NotFound();
            }
            return Ok(user);
        }

        [HttpPut("EditUser")]
        public IActionResult EditUser([FromBody] UserModel userUpdate)
        {
            var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            if (string.IsNullOrEmpty(token))
            {
                return BadRequest("Token is required.");
            }

            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);
            var username = jwtToken.Subject;

            var existingUser = _context.Users.SingleOrDefault(u => u.Username == username);
            if (existingUser == null)
            {
                return NotFound();
            }

            // Update username only if changed
            if (!string.IsNullOrWhiteSpace(userUpdate.Username) &&
                !userUpdate.Username.Equals(existingUser.Username, StringComparison.OrdinalIgnoreCase))
            {
                if (_context.Users.Any(u => u.Username == userUpdate.Username))
                {
                    return BadRequest("Username already taken");
                }
                existingUser.Username = userUpdate.Username;
            }

            if (!string.IsNullOrWhiteSpace(userUpdate.Email))
            {
                existingUser.Email = userUpdate.Email;
            }

            if (!string.IsNullOrWhiteSpace(userUpdate.Password))
            {
                existingUser.Password = BCrypt.Net.BCrypt.HashPassword(userUpdate.Password);
            }

            _context.SaveChanges();

            // Generate new token if username changed
            if (existingUser.Username != username)
            {
                var newToken = GenerateJwtToken(existingUser);
                return Ok(new { token = newToken });
            }

            return Ok(new { message = "Profile updated successfully" });
        }

        [HttpGet("verify")]
        public IActionResult VerifyToken(JwtSecurityToken token)
        {
            if (token == null)
            {
                return BadRequest("Token is required.");
            }
            else

            {
                return Ok();
            }
        }


        private string GenerateJwtToken(UserModel user)
        {
            if (string.IsNullOrEmpty(user.Username))
            {
                throw new ArgumentNullException(nameof(user.Username), "Username is required.");
            }

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Username),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            var keyString = _configuration["Jwt:Key"];
            if (string.IsNullOrEmpty(keyString))
            {
                throw new ArgumentNullException("Jwt:Key", "JWT key is not configured.");
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(30),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}

