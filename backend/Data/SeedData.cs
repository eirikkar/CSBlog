using CSBlog.Data;
using CSBlog.Models;

/// <summary>
/// The SeedData class is used to initialize the database with default data.
/// </summary>
public static class SeedData
{
    /// <summary>
    /// Initializes the database with default data.
    /// This method will create an admin user if one does not already exist.
    /// The admin user can be changed in the admin panel.
    /// </summary>
    public static void Initialize(AppDbContext context)
    {
        if (!context.Users.Any(u => u.Role == UserRole.Admin))
        {
            var admin = new UserModel
            {
                Username = "admin",
                Email = "admin@example.com",
                Password = BCrypt.Net.BCrypt.HashPassword("test"),
                Role = UserRole.Admin,
            };
            context.Users.Add(admin);
            context.SaveChanges();
        }
    }
}
