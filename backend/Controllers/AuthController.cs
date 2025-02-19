using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CSBlog.Data;
using CSBlog.Models;
using CSBlog.Models.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace CSBlog.Controllers
{
    /// <summary>
    /// Controller for handling authentication-related actions.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly string _jwtKey;

        public AuthController(AppDbContext context, IConfiguration configuration, string jwtKey)
        {
            _context = context;
            _configuration = configuration;
            _jwtKey = jwtKey;
        }

        /// <summary>
        /// Authenticates a user and generates a JWT token.
        /// </summary>
        /// <param name="loginDto">The user login details.</param>
        /// <returns>A JWT token and user role.</returns>
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequestDto loginDto)
        {
            // Find the user by username
            var user = _context.Users.SingleOrDefault(u => u.Username == loginDto.Username);
            // Verify the password
            if (user != null && BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password))
            {
                if (string.IsNullOrEmpty(user.Username))
                {
                    return BadRequest("Username is required.");
                }

                // Generate JWT token
                var token = GenerateJwtToken(user);
                var response = new LoginResponseDto
                {
                    Token = token,
                    Role = user.Role.ToString() ?? "User",
                };

                return Ok(response);
            }
            return Unauthorized();
        }

        /// <summary>
        /// Retrieves the authenticated user's details.
        /// </summary>
        /// <returns>The user's details.</returns>
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

                var user = _context
                    .Users.AsNoTracking()
                    .SingleOrDefault(u => u.Username == username);

                if (user == null)
                {
                    return NotFound();
                }

                var userResponse = new UserResponseDto
                {
                    Username = user.Username!,
                    Email = user.Email!,
                };

                return Ok(userResponse);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Updates the authenticated user's details.
        /// </summary>
        /// <param name="userUpdateDto">The updated user details.</param>
        /// <returns>The new JWT token and updated user details.</returns>
        [HttpPut("edituser")]
        public IActionResult EditUser([FromBody] UserUpdateDto userUpdateDto)
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

                var existingUser = _context.Users.SingleOrDefault(u => u.Username == oldUsername);

                if (existingUser == null)
                    return NotFound();

                // Update username if provided and changed
                if (
                    !string.IsNullOrWhiteSpace(userUpdateDto.Username)
                    && !userUpdateDto.Username.Equals(
                        oldUsername,
                        StringComparison.OrdinalIgnoreCase
                    )
                )
                {
                    if (_context.Users.Any(u => u.Username == userUpdateDto.Username))
                    {
                        return BadRequest("Username already taken");
                    }
                    existingUser.Username = userUpdateDto.Username.Trim();
                }

                // Update email if provided
                if (!string.IsNullOrWhiteSpace(userUpdateDto.Email))
                {
                    existingUser.Email = userUpdateDto.Email.Trim();
                }

                // Update password if provided
                if (!string.IsNullOrWhiteSpace(userUpdateDto.Password))
                {
                    existingUser.Password = BCrypt.Net.BCrypt.HashPassword(userUpdateDto.Password);
                }

                _context.SaveChanges();

                var newToken = GenerateJwtToken(existingUser);
                var response = new
                {
                    token = newToken,
                    user = new UserResponseDto
                    {
                        Username = existingUser.Username!,
                        Email = existingUser.Email!,
                    },
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Verifies the validity of a JWT token.
        /// </summary>
        /// <returns>Whether the token is valid.</returns>
        [HttpGet("verify")]
        public IActionResult VerifyToken()
        {
            try
            {
                var token = Request
                    .Headers["Authorization"]
                    .ToString()
                    .Replace("Bearer ", "")
                    .Trim();

                if (string.IsNullOrEmpty(token))
                {
                    return Unauthorized(new { error = "Token is required" });
                }

                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_jwtKey);

                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _configuration["Jwt:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = _configuration["Jwt:Audience"],
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero,
                };

                ClaimsPrincipal principal = tokenHandler.ValidateToken(
                    token,
                    validationParameters,
                    out SecurityToken validatedToken
                );
                var jwtToken = (JwtSecurityToken)validatedToken;

                var usernameClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;
                var roleClaim = jwtToken
                    .Claims.FirstOrDefault(c =>
                        c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
                    )
                    ?.Value;

                if (usernameClaim == null)
                {
                    return Unauthorized(new { error = "Invalid token" });
                }

                var userExists = _context.Users.Any(u => u.Username == usernameClaim);

                return userExists
                    ? Ok(new { valid = true, user = usernameClaim })
                    : Unauthorized(new { error = "User no longer exists" });
            }
            catch (SecurityTokenExpiredException)
            {
                return Unauthorized(new { error = "Token has expired" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = $"Internal server error: {ex.Message}" });
            }
        }

        /// <summary>
        /// Generates a JWT token for the specified user.
        /// </summary>
        /// <param name="user">The user for whom to generate the token.</param>
        /// <returns>The generated JWT token.</returns>
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
                new Claim(ClaimTypes.Role, user.Role.ToString() ?? "User"),
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(60),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
