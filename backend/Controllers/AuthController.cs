using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CSBlog.Data;
using CSBlog.Models;
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

        /// <summary>
        /// Initializes a new instance of the AuthController class.
        /// </summary>
        /// <param name="context">The database context.</param>
        /// <param name="configuration">The configuration settings.</param>
        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        /// <summary>
        /// Authenticates a user and generates a JWT token.
        /// </summary>
        /// <param name="login">The user login details.</param>
        /// <returns>An action result containing the JWT token and user role.</returns>
        [HttpPost("login")]
        public IActionResult Login(UserModel login)
        {
            // Find the user by username
            var user = _context.Users.SingleOrDefault(u => u.Username == login.Username);
            // Verify the password
            if (user != null && BCrypt.Net.BCrypt.Verify(login.Password, user.Password))
            {
                if (string.IsNullOrEmpty(user.Username))
                {
                    return BadRequest("Username is required.");
                }

                // Generate JWT token
                var token = GenerateJwtToken(user);
                return Ok(new { token, role = user.Role.ToString() });
            }
            return Unauthorized();
        }

        /// <summary>
        /// Retrieves the authenticated user's details.
        /// </summary>
        /// <returns>An action result containing the user's details.</returns>
        [HttpGet("getuser")]
        public IActionResult GetUser()
        {
            // Extract the token from the Authorization header
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

                // Find the user by username
                var user = _context
                    .Users.AsNoTracking()
                    .SingleOrDefault(u => u.Username == username);

                return user == null ? NotFound() : Ok(new { user.Username, user.Email });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Updates the authenticated user's details.
        /// </summary>
        /// <param name="userUpdate">The updated user details.</param>
        /// <returns>An action result containing the new JWT token and updated user details.</returns>
        [HttpPut("edituser")]
        public IActionResult EditUser([FromBody] UserModel userUpdate)
        {
            try
            {
                // Extract the token from the Authorization header
                var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
                if (string.IsNullOrEmpty(token))
                {
                    return BadRequest("Token is required.");
                }

                var handler = new JwtSecurityTokenHandler();
                var jwtToken = handler.ReadJwtToken(token);
                var oldUsername = jwtToken.Subject;

                // Find the existing user by username
                var existingUser = _context.Users.SingleOrDefault(u => u.Username == oldUsername);

                if (existingUser == null)
                    return NotFound();

                // Update username
                if (
                    !string.IsNullOrWhiteSpace(userUpdate.Username)
                    && !userUpdate.Username.Equals(oldUsername, StringComparison.OrdinalIgnoreCase)
                )
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
                return Ok(
                    new
                    {
                        token = newToken,
                        user = new { existingUser.Username, existingUser.Email },
                    }
                );
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Verifies the validity of a JWT token.
        /// </summary>
        /// <returns>An action result indicating whether the token is valid.</returns>
        [HttpGet("verify")]
        public IActionResult VerifyToken()
        {
            try
            {
                // Extract the token from the Authorization header
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
                var keyString = _configuration["Jwt:Key"];
                if (string.IsNullOrEmpty(keyString))
                {
                    throw new ArgumentNullException("Jwt:Key", "JWT key is not configured.");
                }

                var key = Encoding.ASCII.GetBytes(keyString);

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

                // Validate the token
                ClaimsPrincipal principal = tokenHandler.ValidateToken(
                    token,
                    validationParameters,
                    out SecurityToken validatedToken
                );
                var jwtToken = (JwtSecurityToken)validatedToken;

                // Extract claims from the token
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

                // Check if the user exists in the database
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

            // Define the claims for the token
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Username),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Role, user.Role.ToString() ?? "User"),
            };

            var keyString = _configuration["Jwt:Key"];
            if (string.IsNullOrEmpty(keyString))
            {
                throw new ArgumentNullException("Jwt:Key", "JWT key is not configured.");
            }

            // Create the security key and signing credentials
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Create the JWT token
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(60),
                signingCredentials: creds
            );

            // Return the serialized token
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
