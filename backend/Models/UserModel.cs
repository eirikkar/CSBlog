namespace CSBlog.Models;

public enum UserRole
{
    Admin,
    User
}

public class UserModel
{
    public Guid Id { get; set; }
    public string? Username { get; set; }
    public string? Password { get; set; }
    public string? Email { get; set; }
    public UserRole? Role { get; set; } = UserRole.User;
}
