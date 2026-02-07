using BookTracker.Core.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace BookTracker.Infrastructure.Data;

/// <summary>
/// Application database context for BookTracker.
/// Inherits from IdentityDbContext to support ASP.NET Core Identity.
/// </summary>
public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
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
    /// Gets or sets the Books DbSet.
    /// </summary>
    public DbSet<Book> Books => Set<Book>();

    /// <summary>
    /// Gets or sets the Ratings DbSet.
    /// </summary>
    public DbSet<Rating> Ratings => Set<Rating>();

    /// <summary>
    /// Gets or sets the UserPreferences DbSet.
    /// </summary>
    public DbSet<UserPreferences> UserPreferences => Set<UserPreferences>();

    /// <summary>
    /// Configures the schema needed for the application and Identity framework.
    /// </summary>
    /// <param name="modelBuilder">The builder being used to construct the model for this context.</param>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Book entity
        ConfigureBookEntity(modelBuilder);

        // Configure Rating entity
        ConfigureRatingEntity(modelBuilder);

        // Configure UserPreferences entity
        ConfigureUserPreferencesEntity(modelBuilder);
    }

    private static void ConfigureBookEntity(ModelBuilder modelBuilder)
    {
        var bookEntity = modelBuilder.Entity<Book>();
        
        bookEntity.ToTable("Books");
        bookEntity.HasKey(item => item.Id);
        
        // String properties with length constraints
        bookEntity.Property(item => item.Title).IsRequired().HasMaxLength(500);
        bookEntity.Property(item => item.Author).IsRequired().HasMaxLength(200);
        bookEntity.Property(item => item.UserId).IsRequired();
        bookEntity.Property(item => item.Isbn).HasMaxLength(20);
        bookEntity.Property(item => item.CoverImageUrl).HasMaxLength(500);
        bookEntity.Property(item => item.Description).HasMaxLength(2000);
        bookEntity.Property(item => item.Genres).HasMaxLength(1000);
        bookEntity.Property(item => item.Source).HasMaxLength(50);
        
        // Other properties
        bookEntity.Property(item => item.Status).IsRequired();
        bookEntity.Property(item => item.AddedDate).IsRequired();
        
        // Indexes for query performance
        bookEntity.HasIndex(item => item.UserId).HasDatabaseName("IX_Books_UserId");
        bookEntity.HasIndex(item => new { item.UserId, item.Title }).HasDatabaseName("IX_Books_UserId_Title");
        bookEntity.HasIndex(item => item.Status).HasDatabaseName("IX_Books_Status");
        
        // Relationships
        bookEntity.HasOne(item => item.User).WithMany(usr => usr.Books).HasForeignKey(item => item.UserId).OnDelete(DeleteBehavior.Cascade);
        bookEntity.HasOne(item => item.Rating).WithOne(rate => rate.Book).HasForeignKey<Rating>(rate => rate.BookId).OnDelete(DeleteBehavior.Cascade);
    }

    private static void ConfigureRatingEntity(ModelBuilder modelBuilder)
    {
        var ratingEntity = modelBuilder.Entity<Rating>();
        
        ratingEntity.ToTable("Ratings");
        ratingEntity.HasKey(item => item.Id);
        
        // Properties
        ratingEntity.Property(item => item.BookId).IsRequired();
        ratingEntity.Property(item => item.Score).IsRequired();
        ratingEntity.Property(item => item.Notes).HasMaxLength(1000);
        ratingEntity.Property(item => item.RatedDate).IsRequired();
        
        // Check constraint for score range (1-5)
        ratingEntity.ToTable(tbl => tbl.HasCheckConstraint("CK_Ratings_Score", "\"Score\" >= 1 AND \"Score\" <= 5"));
        
        // Unique index on BookId
        ratingEntity.HasIndex(item => item.BookId).IsUnique().HasDatabaseName("IX_Ratings_BookId");
        
        // Relationship already configured in Book entity
    }

    private static void ConfigureUserPreferencesEntity(ModelBuilder modelBuilder)
    {
        var prefsEntity = modelBuilder.Entity<UserPreferences>();
        
        prefsEntity.ToTable("UserPreferences");
        prefsEntity.HasKey(item => item.Id);
        
        // Properties
        prefsEntity.Property(item => item.UserId).IsRequired();
        prefsEntity.Property(item => item.PreferredGenres).HasMaxLength(2000);
        prefsEntity.Property(item => item.PreferredThemes).HasMaxLength(2000);
        prefsEntity.Property(item => item.FavoriteAuthors).HasMaxLength(2000);
        prefsEntity.Property(item => item.CreatedDate).IsRequired();
        
        // Unique index on UserId
        prefsEntity.HasIndex(item => item.UserId).IsUnique().HasDatabaseName("IX_UserPreferences_UserId");
        
        // Relationship
        prefsEntity.HasOne(item => item.User).WithOne(usr => usr.Preferences).HasForeignKey<UserPreferences>(item => item.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}
