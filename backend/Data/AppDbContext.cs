using Microsoft.EntityFrameworkCore;
using CSBlog.Models;

namespace CSBlog.Data;

public class AppDbContext : DbContext
{

    public required DbSet<UserModel> Users { get; set; }
    public required DbSet<PostModel> Posts { get; set; }

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }


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
