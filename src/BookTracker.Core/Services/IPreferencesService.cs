using BookTracker.Core.Entities;

namespace BookTracker.Core.Services;

/// <summary>
/// Contract for user preferences management operations.
/// </summary>
public interface IPreferencesService
{
    /// <summary>Retrieves preferences for a user, creating defaults if none exist.</summary>
    Task<UserPreferences> GetUserPreferencesAsync(string userId);

    /// <summary>Updates user preferences (upsert behavior).</summary>
    Task<UserPreferences> UpdatePreferencesAsync(string userId, string[]? preferredGenres, string[]? preferredThemes, string[]? favoriteAuthors);

    /// <summary>Creates default empty preferences for a user.</summary>
    Task<UserPreferences> CreateDefaultPreferencesAsync(string userId);
}
