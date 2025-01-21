using Microsoft.EntityFrameworkCore;
using CSBlog.Models;
namespace CSBlog.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public required DbSet<PostModel> Posts { get; set; }


}
