using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace BookTracker.Infrastructure.Data;

/// <summary>
/// Application database context for BookTracker.
/// Inherits from IdentityDbContext to support ASP.NET Core Identity.
/// </summary>
public class ApplicationDbContext : IdentityDbContext
{
    /// <summary>
    /// Initializes a new instance of the <see cref="ApplicationDbContext"/> class.
    /// </summary>
    /// <param name="options">The options to be used by the DbContext.</param>
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    /// <summary>
    /// Configures the schema needed for the application and Identity framework.
    /// </summary>
    /// <param name="modelBuilder">The builder being used to construct the model for this context.</param>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Entity configurations will be added here as entities are created
        // Example: modelBuilder.ApplyConfiguration(new BookConfiguration());
    }
}
