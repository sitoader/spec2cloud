namespace BookTracker.Api.Models.Preferences;

/// <summary>
/// Data transfer object representing user reading preferences.
/// </summary>
public record UserPreferencesDto
{
    /// <summary>Gets the preferences identifier.</summary>
    public required Guid Id { get; init; }

    /// <summary>Gets the preferred genres.</summary>
    public string[]? PreferredGenres { get; init; }

    /// <summary>Gets the preferred themes.</summary>
    public string[]? PreferredThemes { get; init; }

    /// <summary>Gets the favorite authors.</summary>
    public string[]? FavoriteAuthors { get; init; }

    /// <summary>Gets the date when preferences were created.</summary>
    public required DateTime CreatedDate { get; init; }

    /// <summary>Gets the date when preferences were last updated.</summary>
    public DateTime? UpdatedDate { get; init; }
}
