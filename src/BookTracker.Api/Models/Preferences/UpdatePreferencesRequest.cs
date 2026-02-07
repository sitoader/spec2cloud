namespace BookTracker.Api.Models.Preferences;

/// <summary>
/// Request model for updating user reading preferences.
/// </summary>
public record UpdatePreferencesRequest
{
    /// <summary>Gets the preferred genres.</summary>
    public string[]? PreferredGenres { get; init; }

    /// <summary>Gets the preferred themes.</summary>
    public string[]? PreferredThemes { get; init; }

    /// <summary>Gets the favorite authors.</summary>
    public string[]? FavoriteAuthors { get; init; }
}
