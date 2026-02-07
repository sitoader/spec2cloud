using System.Text.Json;
using BookTracker.Core.Entities;
using BookTracker.Core.Repositories;
using BookTracker.Core.Services;
using Microsoft.Extensions.Logging;
using NSubstitute;
using NSubstitute.ReturnsExtensions;

namespace BookTracker.Core.Tests.Services;

/// <summary>
/// Unit tests for <see cref="PreferencesService"/> covering default creation,
/// upsert behavior, and JSON serialization.
/// </summary>
public class PreferencesServiceTests
{
    private readonly IPreferencesRepository _repo;
    private readonly PreferencesService _svc;
    private const string UserId = "user-1";

    public PreferencesServiceTests()
    {
        _repo = Substitute.For<IPreferencesRepository>();
        var logger = Substitute.For<ILogger<PreferencesService>>();
        _svc = new PreferencesService(_repo, logger);
    }

    // ── GetUserPreferencesAsync ─────────────────────────────────

    [Fact]
    public async Task GetUserPreferencesAsync_ReturnsExisting_WhenPrefsExist()
    {
        var existing = new UserPreferences
        {
            Id = Guid.NewGuid(),
            UserId = UserId,
            PreferredGenres = "[\"Fiction\"]",
            CreatedDate = DateTime.UtcNow,
        };
        _repo.GetByUserIdAsync(UserId).Returns(existing);

        var result = await _svc.GetUserPreferencesAsync(UserId);

        Assert.Equal(existing.Id, result.Id);
        Assert.Equal("[\"Fiction\"]", result.PreferredGenres);
    }

    [Fact]
    public async Task GetUserPreferencesAsync_CreatesDefault_WhenNoneExist()
    {
        _repo.GetByUserIdAsync(UserId).ReturnsNull();

        var result = await _svc.GetUserPreferencesAsync(UserId);

        Assert.Equal(UserId, result.UserId);
        Assert.Null(result.PreferredGenres);
        Assert.Null(result.PreferredThemes);
        Assert.Null(result.FavoriteAuthors);
        await _repo.Received(1).AddAsync(Arg.Any<UserPreferences>());
    }

    // ── UpdatePreferencesAsync ──────────────────────────────────

    [Fact]
    public async Task UpdatePreferencesAsync_CreatesNew_WhenNoneExist()
    {
        _repo.GetByUserIdAsync(UserId).ReturnsNull();

        var genres = new[] { "Sci-Fi", "Fantasy" };
        var themes = new[] { "Adventure" };
        var authors = new[] { "Tolkien" };

        var result = await _svc.UpdatePreferencesAsync(UserId, genres, themes, authors);

        Assert.Equal(UserId, result.UserId);
        Assert.Equal(JsonSerializer.Serialize(genres), result.PreferredGenres);
        Assert.Equal(JsonSerializer.Serialize(themes), result.PreferredThemes);
        Assert.Equal(JsonSerializer.Serialize(authors), result.FavoriteAuthors);
        await _repo.Received(1).AddAsync(Arg.Any<UserPreferences>());
    }

    [Fact]
    public async Task UpdatePreferencesAsync_UpdatesExisting()
    {
        var existing = new UserPreferences
        {
            Id = Guid.NewGuid(),
            UserId = UserId,
            PreferredGenres = "[\"Old\"]",
            CreatedDate = DateTime.UtcNow.AddDays(-1),
        };
        _repo.GetByUserIdAsync(UserId).Returns(existing);

        var newGenres = new[] { "New Genre" };

        var result = await _svc.UpdatePreferencesAsync(UserId, newGenres, null, null);

        Assert.Equal(JsonSerializer.Serialize(newGenres), result.PreferredGenres);
        Assert.Null(result.PreferredThemes);
        Assert.Null(result.FavoriteAuthors);
        Assert.NotNull(result.UpdatedDate);
        await _repo.Received(1).UpdateAsync(Arg.Any<UserPreferences>());
    }

    [Fact]
    public async Task UpdatePreferencesAsync_HandlesEmptyArrays()
    {
        _repo.GetByUserIdAsync(UserId).ReturnsNull();

        var result = await _svc.UpdatePreferencesAsync(UserId, Array.Empty<string>(), Array.Empty<string>(), Array.Empty<string>());

        Assert.Equal("[]", result.PreferredGenres);
        Assert.Equal("[]", result.PreferredThemes);
        Assert.Equal("[]", result.FavoriteAuthors);
    }

    [Fact]
    public async Task UpdatePreferencesAsync_HandlesNullArrays()
    {
        _repo.GetByUserIdAsync(UserId).ReturnsNull();

        var result = await _svc.UpdatePreferencesAsync(UserId, null, null, null);

        Assert.Null(result.PreferredGenres);
        Assert.Null(result.PreferredThemes);
        Assert.Null(result.FavoriteAuthors);
    }

    // ── CreateDefaultPreferencesAsync ────────────────────────────

    [Fact]
    public async Task CreateDefaultPreferencesAsync_CreatesEmptyPreferences()
    {
        var result = await _svc.CreateDefaultPreferencesAsync(UserId);

        Assert.Equal(UserId, result.UserId);
        Assert.Null(result.PreferredGenres);
        Assert.Null(result.PreferredThemes);
        Assert.Null(result.FavoriteAuthors);
        Assert.NotEqual(Guid.Empty, result.Id);
        await _repo.Received(1).AddAsync(Arg.Any<UserPreferences>());
    }

    // ── JSON serialization ──────────────────────────────────────

    [Fact]
    public async Task UpdatePreferencesAsync_SerializesArraysAsJson()
    {
        _repo.GetByUserIdAsync(UserId).ReturnsNull();

        UserPreferences? captured = null;
        _repo.AddAsync(Arg.Do<UserPreferences>(p => captured = p))
            .Returns(Task.CompletedTask);

        var genres = new[] { "Mystery", "Thriller" };
        await _svc.UpdatePreferencesAsync(UserId, genres, null, null);

        Assert.NotNull(captured);
        var deserialized = JsonSerializer.Deserialize<string[]>(captured!.PreferredGenres!);
        Assert.NotNull(deserialized);
        Assert.Equal(2, deserialized!.Length);
        Assert.Contains("Mystery", deserialized);
        Assert.Contains("Thriller", deserialized);
    }
}
