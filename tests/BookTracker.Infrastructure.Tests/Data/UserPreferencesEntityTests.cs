using BookTracker.Core.Entities;
using BookTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookTracker.Infrastructure.Tests.Data;

/// <summary>
/// Tests for UserPreferences entity and its database configuration
/// </summary>
public class UserPreferencesEntityTests
{
    private DbContextOptions<ApplicationDbContext> CreateInMemoryOptions()
    {
        return new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
    }

    [Fact]
    public async Task UserPreferences_CanBeSavedAndRetrieved()
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

        var preferences = new UserPreferences
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            PreferredGenres = "[\"Science Fiction\",\"Mystery\"]",
            PreferredThemes = "[\"Adventure\",\"Technology\"]",
            FavoriteAuthors = "[\"Isaac Asimov\",\"Arthur C. Clarke\"]",
            CreatedDate = DateTime.UtcNow
        };

        // Act
        await context.UserPreferences.AddAsync(preferences);
        var result = await context.SaveChangesAsync();

        // Assert
        Assert.Equal(1, result);
        var savedPrefs = await context.UserPreferences.FindAsync(preferences.Id);
        Assert.NotNull(savedPrefs);
        Assert.Equal("[\"Science Fiction\",\"Mystery\"]", savedPrefs.PreferredGenres);
        Assert.Equal("[\"Adventure\",\"Technology\"]", savedPrefs.PreferredThemes);
        Assert.Equal("[\"Isaac Asimov\",\"Arthur C. Clarke\"]", savedPrefs.FavoriteAuthors);
    }

    [Fact]
    public async Task UserPreferences_CascadeDelete_RemovesWhenUserDeleted()
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
        
        var preferences = new UserPreferences
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            PreferredGenres = "[\"Fantasy\"]",
            CreatedDate = DateTime.UtcNow
        };
        await context.UserPreferences.AddAsync(preferences);
        await context.SaveChangesAsync();
        
        var prefsId = preferences.Id;

        // Act
        context.Users.Remove(user);
        await context.SaveChangesAsync();

        // Assert
        var deletedPrefs = await context.UserPreferences.FindAsync(prefsId);
        Assert.Null(deletedPrefs);
    }

    [Fact]
    public async Task UserPreferences_UpdatedDate_CanBeModified()
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
        
        var preferences = new UserPreferences
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            PreferredGenres = "[\"Romance\"]",
            CreatedDate = DateTime.UtcNow
        };
        await context.UserPreferences.AddAsync(preferences);
        await context.SaveChangesAsync();

        // Act
        preferences.PreferredGenres = "[\"Romance\",\"Drama\"]";
        preferences.UpdatedDate = DateTime.UtcNow;
        await context.SaveChangesAsync();

        // Assert
        var updated = await context.UserPreferences.FindAsync(preferences.Id);
        Assert.NotNull(updated);
        Assert.Equal("[\"Romance\",\"Drama\"]", updated.PreferredGenres);
        Assert.NotNull(updated.UpdatedDate);
    }
}
