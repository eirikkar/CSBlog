using System.Text;
using CSBlog.Data;
using CSBlog.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlite("Data Source=Data/Database/database.db");
});

string GetSecret(string secretFilePath, string fallback)
{
    return File.Exists(secretFilePath) ? File.ReadAllText(secretFilePath).Trim() : fallback;
}

var configJwtKey = builder.Configuration["Jwt:Key"];
var jwtKey = GetSecret("/etc/secrets/jwt_key.txt", builder.Configuration["Jwt:Key"]);

if (string.IsNullOrEmpty(jwtKey))
{
    throw new ArgumentNullException("Jwt:Key", "JWT key is not configured.");
}

var key = Encoding.UTF8.GetBytes(jwtKey);

var jwtSettings = builder.Configuration.GetSection("Jwt");

builder
    .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key),
        };
    });

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder.WithOrigins("http://localhost:3000").AllowAnyHeader().AllowAnyMethod();
    });
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Admin", policy => policy.RequireRole(UserRole.Admin.ToString()));
});
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 5 * 1024 * 1024; // 5MB
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles(
    new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(
            Path.Combine(builder.Environment.ContentRootPath, "Uploads")
        ),
        RequestPath = "/uploads",
    }
);

app.UseRouting();

app.UseCors();

//app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    SeedData.Initialize(services.GetRequiredService<AppDbContext>());
}
app.MapControllers();

app.Run();
