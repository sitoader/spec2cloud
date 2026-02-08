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
    /// Gets or sets the ReadingSessions DbSet.
    /// </summary>
    public DbSet<ReadingSession> ReadingSessions => Set<ReadingSession>();

    /// <summary>
    /// Gets or sets the ReadingProgress DbSet.
    /// </summary>
    public DbSet<ReadingProgress> ReadingProgress => Set<ReadingProgress>();

    /// <summary>
    /// Gets or sets the ReadingStreaks DbSet.
    /// </summary>
    public DbSet<ReadingStreak> ReadingStreaks => Set<ReadingStreak>();

    /// <summary>
    /// Gets or sets the ReadingGoals DbSet.
    /// </summary>
    public DbSet<ReadingGoal> ReadingGoals => Set<ReadingGoal>();

    /// <summary>
    /// Gets or sets the Achievements DbSet.
    /// </summary>
    public DbSet<Achievement> Achievements => Set<Achievement>();

    /// <summary>
    /// Gets or sets the UserAchievements DbSet.
    /// </summary>
    public DbSet<UserAchievement> UserAchievements => Set<UserAchievement>();

    /// <summary>
    /// Gets or sets the Collections DbSet.
    /// </summary>
    public DbSet<Collection> Collections => Set<Collection>();

    /// <summary>
    /// Gets or sets the CollectionBooks DbSet.
    /// </summary>
    public DbSet<CollectionBook> CollectionBooks => Set<CollectionBook>();

    /// <summary>
    /// Gets or sets the BookReviews DbSet.
    /// </summary>
    public DbSet<BookReview> BookReviews => Set<BookReview>();

    /// <summary>
    /// Gets or sets the BookSeries DbSet.
    /// </summary>
    public DbSet<BookSeries> BookSeries => Set<BookSeries>();

    /// <summary>
    /// Gets or sets the BookSeriesEntries DbSet.
    /// </summary>
    public DbSet<BookSeriesEntry> BookSeriesEntries => Set<BookSeriesEntry>();

    /// <summary>
    /// Gets or sets the FollowedAuthors DbSet.
    /// </summary>
    public DbSet<FollowedAuthor> FollowedAuthors => Set<FollowedAuthor>();

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

        // Configure ReadingSession entity
        ConfigureReadingSessionEntity(modelBuilder);

        // Configure ReadingProgress entity
        ConfigureReadingProgressEntity(modelBuilder);

        // Configure ReadingStreak entity
        ConfigureReadingStreakEntity(modelBuilder);

        // Configure ReadingGoal entity
        ConfigureReadingGoalEntity(modelBuilder);

        // Configure Achievement entity
        ConfigureAchievementEntity(modelBuilder);

        // Configure UserAchievement entity
        ConfigureUserAchievementEntity(modelBuilder);

        // Configure Collection entity
        ConfigureCollectionEntity(modelBuilder);

        // Configure CollectionBook entity
        ConfigureCollectionBookEntity(modelBuilder);

        // Configure BookReview entity
        ConfigureBookReviewEntity(modelBuilder);

        // Configure BookSeries entity
        ConfigureBookSeriesEntity(modelBuilder);

        // Configure BookSeriesEntry entity
        ConfigureBookSeriesEntryEntity(modelBuilder);

        // Configure FollowedAuthor entity
        ConfigureFollowedAuthorEntity(modelBuilder);
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

    private static void ConfigureReadingSessionEntity(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<ReadingSession>();
        entity.ToTable("ReadingSessions");
        entity.HasKey(item => item.Id);
        entity.Property(item => item.UserId).IsRequired();
        entity.Property(item => item.BookId).IsRequired();
        entity.Property(item => item.StartTime).IsRequired();
        entity.Property(item => item.Notes).HasMaxLength(2000);
        entity.Property(item => item.CreatedAt).IsRequired();
        entity.HasIndex(item => item.UserId).HasDatabaseName("IX_ReadingSessions_UserId");
        entity.HasIndex(item => item.BookId).HasDatabaseName("IX_ReadingSessions_BookId");
        entity.HasOne(item => item.User).WithMany().HasForeignKey(item => item.UserId).OnDelete(DeleteBehavior.Cascade);
        entity.HasOne(item => item.Book).WithMany().HasForeignKey(item => item.BookId).OnDelete(DeleteBehavior.Cascade);
    }

    private static void ConfigureReadingProgressEntity(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<ReadingProgress>();
        entity.ToTable("ReadingProgress");
        entity.HasKey(item => item.Id);
        entity.Property(item => item.UserId).IsRequired();
        entity.Property(item => item.BookId).IsRequired();
        entity.Property(item => item.CurrentPage).IsRequired();
        entity.Property(item => item.ProgressPercentage).HasPrecision(5, 2);
        entity.Property(item => item.LastUpdated).IsRequired();
        entity.HasIndex(item => new { item.UserId, item.BookId }).IsUnique().HasDatabaseName("IX_ReadingProgress_UserId_BookId");
        entity.HasOne(item => item.User).WithMany().HasForeignKey(item => item.UserId).OnDelete(DeleteBehavior.Cascade);
        entity.HasOne(item => item.Book).WithMany().HasForeignKey(item => item.BookId).OnDelete(DeleteBehavior.Cascade);
    }

    private static void ConfigureReadingStreakEntity(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<ReadingStreak>();
        entity.ToTable("ReadingStreaks");
        entity.HasKey(item => item.Id);
        entity.Property(item => item.UserId).IsRequired();
        entity.Property(item => item.CurrentStreak).IsRequired();
        entity.Property(item => item.LongestStreak).IsRequired();
        entity.Property(item => item.CreatedAt).IsRequired();
        entity.Property(item => item.UpdatedAt).IsRequired();
        entity.HasIndex(item => item.UserId).IsUnique().HasDatabaseName("IX_ReadingStreaks_UserId");
        entity.HasOne(item => item.User).WithMany().HasForeignKey(item => item.UserId).OnDelete(DeleteBehavior.Cascade);
    }

    private static void ConfigureReadingGoalEntity(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<ReadingGoal>();
        entity.ToTable("ReadingGoals");
        entity.HasKey(item => item.Id);
        entity.Property(item => item.UserId).IsRequired();
        entity.Property(item => item.Year).IsRequired();
        entity.Property(item => item.TargetBooksCount).IsRequired();
        entity.Property(item => item.CompletedBooksCount).IsRequired();
        entity.Property(item => item.CreatedAt).IsRequired();
        entity.Property(item => item.UpdatedAt).IsRequired();
        entity.HasIndex(item => new { item.UserId, item.Year }).IsUnique().HasDatabaseName("IX_ReadingGoals_UserId_Year");
        entity.HasOne(item => item.User).WithMany().HasForeignKey(item => item.UserId).OnDelete(DeleteBehavior.Cascade);
    }

    private static void ConfigureAchievementEntity(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<Achievement>();
        entity.ToTable("Achievements");
        entity.HasKey(item => item.Id);
        entity.Property(item => item.Code).IsRequired().HasMaxLength(50);
        entity.Property(item => item.Name).IsRequired().HasMaxLength(100);
        entity.Property(item => item.Description).HasMaxLength(500);
        entity.Property(item => item.IconUrl).HasMaxLength(500);
        entity.Property(item => item.Category).HasMaxLength(50);
        entity.HasIndex(item => item.Code).IsUnique().HasDatabaseName("IX_Achievements_Code");
    }

    private static void ConfigureUserAchievementEntity(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<UserAchievement>();
        entity.ToTable("UserAchievements");
        entity.HasKey(item => item.Id);
        entity.Property(item => item.UserId).IsRequired();
        entity.Property(item => item.AchievementId).IsRequired();
        entity.Property(item => item.UnlockedAt).IsRequired();
        entity.HasIndex(item => new { item.UserId, item.AchievementId }).IsUnique().HasDatabaseName("IX_UserAchievements_UserId_AchievementId");
        entity.HasOne(item => item.User).WithMany().HasForeignKey(item => item.UserId).OnDelete(DeleteBehavior.Cascade);
        entity.HasOne(item => item.Achievement).WithMany(a => a.UserAchievements).HasForeignKey(item => item.AchievementId).OnDelete(DeleteBehavior.Cascade);
    }

    private static void ConfigureCollectionEntity(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<Collection>();
        entity.ToTable("Collections");
        entity.HasKey(item => item.Id);
        entity.Property(item => item.UserId).IsRequired();
        entity.Property(item => item.Name).IsRequired().HasMaxLength(200);
        entity.Property(item => item.Description).HasMaxLength(2000);
        entity.Property(item => item.CreatedAt).IsRequired();
        entity.Property(item => item.UpdatedAt).IsRequired();
        entity.HasIndex(item => item.UserId).HasDatabaseName("IX_Collections_UserId");
        entity.HasOne(item => item.User).WithMany().HasForeignKey(item => item.UserId).OnDelete(DeleteBehavior.Cascade);
    }

    private static void ConfigureCollectionBookEntity(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<CollectionBook>();
        entity.ToTable("CollectionBooks");
        entity.HasKey(item => item.Id);
        entity.Property(item => item.CollectionId).IsRequired();
        entity.Property(item => item.BookId).IsRequired();
        entity.Property(item => item.AddedAt).IsRequired();
        entity.Property(item => item.Notes).HasMaxLength(2000);
        entity.HasIndex(item => new { item.CollectionId, item.BookId }).IsUnique().HasDatabaseName("IX_CollectionBooks_CollectionId_BookId");
        entity.HasOne(item => item.Collection).WithMany(c => c.CollectionBooks).HasForeignKey(item => item.CollectionId).OnDelete(DeleteBehavior.Cascade);
        entity.HasOne(item => item.Book).WithMany().HasForeignKey(item => item.BookId).OnDelete(DeleteBehavior.Cascade);
    }

    private static void ConfigureBookReviewEntity(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<BookReview>();
        entity.ToTable("BookReviews");
        entity.HasKey(item => item.Id);
        entity.Property(item => item.UserId).IsRequired();
        entity.Property(item => item.BookId).IsRequired();
        entity.Property(item => item.Rating).IsRequired();
        entity.Property(item => item.ReviewText).HasMaxLength(10000);
        entity.Property(item => item.ReviewHtml).HasMaxLength(20000);
        entity.Property(item => item.Tags).HasColumnType("jsonb");
        entity.Property(item => item.Mood).HasMaxLength(50);
        entity.Property(item => item.CreatedAt).IsRequired();
        entity.Property(item => item.UpdatedAt).IsRequired();
        entity.ToTable(tbl => tbl.HasCheckConstraint("CK_BookReviews_Rating", "\"Rating\" >= 1 AND \"Rating\" <= 5"));
        entity.HasIndex(item => new { item.UserId, item.BookId }).IsUnique().HasDatabaseName("IX_BookReviews_UserId_BookId");
        entity.HasOne(item => item.User).WithMany().HasForeignKey(item => item.UserId).OnDelete(DeleteBehavior.Cascade);
        entity.HasOne(item => item.Book).WithMany().HasForeignKey(item => item.BookId).OnDelete(DeleteBehavior.Cascade);
    }

    private static void ConfigureBookSeriesEntity(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<BookSeries>();
        entity.ToTable("BookSeries");
        entity.HasKey(item => item.Id);
        entity.Property(item => item.Name).IsRequired().HasMaxLength(200);
        entity.Property(item => item.Description).HasMaxLength(2000);
        entity.Property(item => item.CreatedAt).IsRequired();
    }

    private static void ConfigureBookSeriesEntryEntity(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<BookSeriesEntry>();
        entity.ToTable("BookSeriesEntries");
        entity.HasKey(item => item.Id);
        entity.Property(item => item.SeriesId).IsRequired();
        entity.Property(item => item.BookId).IsRequired();
        entity.Property(item => item.PositionInSeries).IsRequired();
        entity.HasIndex(item => new { item.SeriesId, item.BookId }).IsUnique().HasDatabaseName("IX_BookSeriesEntries_SeriesId_BookId");
        entity.HasOne(item => item.Series).WithMany(s => s.Entries).HasForeignKey(item => item.SeriesId).OnDelete(DeleteBehavior.Cascade);
        entity.HasOne(item => item.Book).WithMany().HasForeignKey(item => item.BookId).OnDelete(DeleteBehavior.Cascade);
    }

    private static void ConfigureFollowedAuthorEntity(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<FollowedAuthor>();
        entity.ToTable("FollowedAuthors");
        entity.HasKey(item => item.Id);
        entity.Property(item => item.UserId).IsRequired();
        entity.Property(item => item.AuthorName).IsRequired().HasMaxLength(200);
        entity.Property(item => item.FollowedAt).IsRequired();
        entity.HasIndex(item => new { item.UserId, item.AuthorName }).IsUnique().HasDatabaseName("IX_FollowedAuthors_UserId_AuthorName");
        entity.HasOne(item => item.User).WithMany().HasForeignKey(item => item.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}
