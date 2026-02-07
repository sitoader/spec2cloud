using System.Text.Json;
using BookTracker.Core.Entities;
using BookTracker.Core.Repositories;
using Microsoft.Extensions.Logging;

namespace BookTracker.Core.Services;

/// <summary>
/// Orchestrates user preferences operations with JSON serialization.
/// </summary>
public class PreferencesService : IPreferencesService
{
    private readonly IPreferencesRepository _repo;
    private readonly ILogger<PreferencesService> _logger;

    public PreferencesService(IPreferencesRepository repo, ILogger<PreferencesService> logger)
    {
        _repo = repo;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<UserPreferences> GetUserPreferencesAsync(string userId)
    {
        var prefs = await _repo.GetByUserIdAsync(userId);
        if (prefs is not null)
            return prefs;

        return await CreateDefaultPreferencesAsync(userId);
    }

    /// <inheritdoc />
    public async Task<UserPreferences> UpdatePreferencesAsync(string userId, string[]? preferredGenres, string[]? preferredThemes, string[]? favoriteAuthors)
    {
        var prefs = await _repo.GetByUserIdAsync(userId);

        if (prefs is null)
        {
            prefs = new UserPreferences
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                PreferredGenres = SerializeArray(preferredGenres),
                PreferredThemes = SerializeArray(preferredThemes),
                FavoriteAuthors = SerializeArray(favoriteAuthors),
                CreatedDate = DateTime.UtcNow,
            };
            await _repo.AddAsync(prefs);
            _logger.LogInformation("Preferences created for user {UserId}", userId);
        }
        else
        {
            prefs.PreferredGenres = SerializeArray(preferredGenres);
            prefs.PreferredThemes = SerializeArray(preferredThemes);
            prefs.FavoriteAuthors = SerializeArray(favoriteAuthors);
            prefs.UpdatedDate = DateTime.UtcNow;
            await _repo.UpdateAsync(prefs);
            _logger.LogInformation("Preferences updated for user {UserId}", userId);
        }

        return prefs;
    }

    /// <inheritdoc />
    public async Task<UserPreferences> CreateDefaultPreferencesAsync(string userId)
    {
        var prefs = new UserPreferences
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CreatedDate = DateTime.UtcNow,
        };

        await _repo.AddAsync(prefs);
        _logger.LogInformation("Default preferences created for user {UserId}", userId);
        return prefs;
    }

    private static string? SerializeArray(string[]? items)
    {
        if (items is null)
            return null;

        return JsonSerializer.Serialize(items);
    }
}
