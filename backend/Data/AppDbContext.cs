using CSBlog.Models;
using Microsoft.EntityFrameworkCore;

namespace CSBlog.Data;

/// <summary>
/// The AppDbContext class represents the database context for the application.
/// It is used to interact with the database using Entity Framework Core.
/// </summary>
public class AppDbContext : DbContext
{
    /// <summary>
    /// Gets or sets the Users DbSet, which represents the Users table in the database.
    /// </summary>
    public required DbSet<UserModel> Users { get; set; }

    /// <summary>
    /// Gets or sets the Posts DbSet, which represents the Posts table in the database.
    /// </summary>
    public required DbSet<PostModel> Posts { get; set; }

    /// <summary>
    /// Initializes a new instance of the AppDbContext class.
    /// </summary>
    /// <param name="options">The options to be used by the DbContext.</param>
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    /// <summary
    /// Configures the model that the model builder will use to construct the database schema.
    /// </summary>
    /// <param name="modelBuilder">The builder being used to construct the model for this context.</param>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<PostModel>(entity =>
        {
            entity.ToTable("Posts");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired();
            entity.Property(e => e.Content).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();
            entity.Property(e => e.ImageUrl);
        });

        modelBuilder.Entity<UserModel>(entity =>
        {
            entity.ToTable("Users");
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Username).IsRequired();
            entity.Property(u => u.Password).IsRequired();
            entity.Property(u => u.Email).IsRequired();
            entity.HasIndex(u => u.Username).IsUnique();
            entity.Property(u => u.Role).HasDefaultValue(UserRole.User).IsRequired();
        });
    }
}
