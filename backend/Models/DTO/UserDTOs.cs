namespace CSBlog.Models.DTOs;

public class LoginRequestDto
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

public class UserResponseDto
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public class UserUpdateDto
{
    public string? Username { get; set; }
    public string? Email { get; set; }
    public string? Password { get; set; }
}
