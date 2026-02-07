using BookTracker.Core.Entities;
using BookTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookTracker.Infrastructure.Tests.Data;

/// <summary>
/// Tests for Book entity and its database configuration
/// </summary>
public class BookEntityTests
{
    private DbContextOptions<ApplicationDbContext> CreateInMemoryOptions()
    {
        return new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
    }

    [Fact]
    public async Task Book_WithRequiredFields_CanBeSaved()
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
        await context.SaveChangesAsync();

        var book = new Book
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Title = "Test Book",
            Author = "Test Author",
            Status = BookStatus.ToRead,
            AddedDate = DateTime.UtcNow
        };

        // Act
        await context.Books.AddAsync(book);
        var result = await context.SaveChangesAsync();

        // Assert
        Assert.Equal(1, result);
        var savedBook = await context.Books.FindAsync(book.Id);
        Assert.NotNull(savedBook);
        Assert.Equal("Test Book", savedBook.Title);
        Assert.Equal("Test Author", savedBook.Author);
    }

    [Fact]
    public async Task Book_CascadeDelete_RemovesBookWhenUserDeleted()
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
            Status = BookStatus.ToRead,
            AddedDate = DateTime.UtcNow
        };
        await context.Books.AddAsync(book);
        await context.SaveChangesAsync();
        
        var bookId = book.Id;

        // Act
        context.Users.Remove(user);
        await context.SaveChangesAsync();

        // Assert
        var deletedBook = await context.Books.FindAsync(bookId);
        Assert.Null(deletedBook);
    }

    [Fact]
    public async Task Book_WithOptionalFields_SavesCorrectly()
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
        await context.SaveChangesAsync();

        var book = new Book
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Title = "Complete Book",
            Author = "Complete Author",
            Status = BookStatus.Reading,
            AddedDate = DateTime.UtcNow,
            Isbn = "978-3-16-148410-0",
            CoverImageUrl = "https://example.com/cover.jpg",
            Description = "A comprehensive book description",
            Genres = "[\"Fiction\",\"Adventure\"]",
            Source = "google-books",
            PublicationDate = new DateTime(2020, 1, 1)
        };

        // Act
        await context.Books.AddAsync(book);
        await context.SaveChangesAsync();

        // Assert
        var savedBook = await context.Books.FindAsync(book.Id);
        Assert.NotNull(savedBook);
        Assert.Equal("978-3-16-148410-0", savedBook.Isbn);
        Assert.Equal("https://example.com/cover.jpg", savedBook.CoverImageUrl);
        Assert.Equal("A comprehensive book description", savedBook.Description);
        Assert.Equal("[\"Fiction\",\"Adventure\"]", savedBook.Genres);
        Assert.Equal("google-books", savedBook.Source);
        Assert.Equal(new DateTime(2020, 1, 1), savedBook.PublicationDate);
    }
}
