using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
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

        [HttpGet("getuser")]
        public IActionResult GetUser()
        {
            var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            if (string.IsNullOrEmpty(token))
            {
                return BadRequest("Token is required.");
            }

            try
            {
                var handler = new JwtSecurityTokenHandler();
                var jwtToken = handler.ReadJwtToken(token);
                var username = jwtToken.Subject;

                var user = _context.Users
                    .AsNoTracking()
                    .SingleOrDefault(u => u.Username == username);

                return user == null ? NotFound() : Ok(new
                {
                    user.Username,
                    user.Email,
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("edituser")]
        public IActionResult EditUser([FromBody] UserModel userUpdate)
        {
            try
            {
                var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
                if (string.IsNullOrEmpty(token))
                {
                    return BadRequest("Token is required.");
                }

                var handler = new JwtSecurityTokenHandler();
                var jwtToken = handler.ReadJwtToken(token);
                var oldUsername = jwtToken.Subject;

                var existingUser = _context.Users
                    .SingleOrDefault(u => u.Username == oldUsername);

                if (existingUser == null) return NotFound();

                // Update username
                if (!string.IsNullOrWhiteSpace(userUpdate.Username) &&
                    !userUpdate.Username.Equals(oldUsername, StringComparison.OrdinalIgnoreCase))
                {
                    if (_context.Users.Any(u => u.Username == userUpdate.Username))
                    {
                        return BadRequest("Username already taken");
                    }
                    existingUser.Username = userUpdate.Username.Trim();
                }

                // Update email
                if (!string.IsNullOrWhiteSpace(userUpdate.Email))
                {
                    existingUser.Email = userUpdate.Email.Trim();
                }

                // Update password
                if (!string.IsNullOrWhiteSpace(userUpdate.Password))
                {
                    existingUser.Password = BCrypt.Net.BCrypt.HashPassword(userUpdate.Password);
                }

                _context.SaveChanges();

                // Always return new token with updated claims
                var newToken = GenerateJwtToken(existingUser);
                return Ok(new
                {
                    token = newToken,
                    user = new
                    {
                        existingUser.Username,
                        existingUser.Email,
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        [HttpGet("verify")]
        public IActionResult VerifyToken()
        {
            try
            {
                var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
                if (string.IsNullOrEmpty(token))
                {
                    return Unauthorized("Token is required");
                }


                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);


                // Configure token validation parameters
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _configuration["Jwt:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = _configuration["Jwt:Audience"],
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero // No tolerance for expiration time
                };

                // Validate token
                var principal = tokenHandler.ValidateToken(token, validationParameters, out var validatedToken);

                // Additional check for token expiration
                if (validatedToken.ValidTo < DateTime.UtcNow)
                {
                    return Unauthorized("Token has expired");
                }

                // Optionally check if user exists in database
                var username = principal.Identity?.Name;
                var userExists = _context.Users.Any(u => u.Username == username);

                return userExists ? Ok() : Unauthorized("User no longer exists");
            }
            catch (SecurityTokenExpiredException)
            {
                return Unauthorized("Token has expired");
            }
            catch (SecurityTokenValidationException)
            {
                return Unauthorized("Invalid token");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
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

