using BookTracker.Core.Entities;
using BookTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookTracker.Infrastructure.Tests.Data;

/// <summary>
/// Tests for Rating entity and its database configuration
/// </summary>
public class RatingEntityTests
{
    private DbContextOptions<ApplicationDbContext> CreateInMemoryOptions()
    {
        return new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
    }

    [Fact]
    public async Task Rating_WithValidScore_CanBeSaved()
    {
        // Arrange
        var options = CreateInMemoryOptions();
        using var context = new ApplicationDbContext(options);
        
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid().ToString(),
            UserName = "testuser@example.com",
            Email = "testuser@example.com",
            CreatedDate = DateTime.UtcNow
        };
        await context.Users.AddAsync(user);
        
        var book = new Book
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Title = "Test Book",
            Author = "Test Author",
            Status = BookStatus.Completed,
            AddedDate = DateTime.UtcNow
        };
        await context.Books.AddAsync(book);
        await context.SaveChangesAsync();

        var rating = new Rating
        {
            Id = Guid.NewGuid(),
            BookId = book.Id,
            Score = 5,
            Notes = "Excellent book!",
            RatedDate = DateTime.UtcNow
        };

        // Act
        await context.Ratings.AddAsync(rating);
        var result = await context.SaveChangesAsync();

        // Assert
        Assert.Equal(1, result);
        var savedRating = await context.Ratings.FindAsync(rating.Id);
        Assert.NotNull(savedRating);
        Assert.Equal(5, savedRating.Score);
        Assert.Equal("Excellent book!", savedRating.Notes);
    }

    [Theory]
    [InlineData(1)]
    [InlineData(3)]
    [InlineData(5)]
    public async Task Rating_WithScoreInValidRange_Succeeds(int score)
    {
        // Arrange
        var options = CreateInMemoryOptions();
        using var context = new ApplicationDbContext(options);
        
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid().ToString(),
            UserName = "testuser@example.com",
            Email = "testuser@example.com",
            CreatedDate = DateTime.UtcNow
        };
        await context.Users.AddAsync(user);
        
        var book = new Book
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Title = "Test Book",
            Author = "Test Author",
            Status = BookStatus.Completed,
            AddedDate = DateTime.UtcNow
        };
        await context.Books.AddAsync(book);
        await context.SaveChangesAsync();

        var rating = new Rating
        {
            Id = Guid.NewGuid(),
            BookId = book.Id,
            Score = score,
            RatedDate = DateTime.UtcNow
        };

        // Act
        await context.Ratings.AddAsync(rating);
        var result = await context.SaveChangesAsync();

        // Assert
        Assert.Equal(1, result);
        var savedRating = await context.Ratings.FindAsync(rating.Id);
        Assert.NotNull(savedRating);
        Assert.Equal(score, savedRating.Score);
    }

    [Fact]
    public async Task Rating_CascadeDelete_RemovesRatingWhenBookDeleted()
    {
        // Arrange
        var options = CreateInMemoryOptions();
        using var context = new ApplicationDbContext(options);
        
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid().ToString(),
            UserName = "testuser@example.com",
            Email = "testuser@example.com",
            CreatedDate = DateTime.UtcNow
        };
        await context.Users.AddAsync(user);
        
        var book = new Book
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Title = "Test Book",
            Author = "Test Author",
            Status = BookStatus.Completed,
            AddedDate = DateTime.UtcNow
        };
        await context.Books.AddAsync(book);
        
        var rating = new Rating
        {
            Id = Guid.NewGuid(),
            BookId = book.Id,
            Score = 4,
            RatedDate = DateTime.UtcNow
        };
        await context.Ratings.AddAsync(rating);
        await context.SaveChangesAsync();
        
        var ratingId = rating.Id;

        // Act
        context.Books.Remove(book);
        await context.SaveChangesAsync();

        // Assert
        var deletedRating = await context.Ratings.FindAsync(ratingId);
        Assert.Null(deletedRating);
    }
}
