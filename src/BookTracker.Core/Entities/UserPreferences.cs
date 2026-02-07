namespace BookTracker.Core.Entities;

/// <summary>
/// Represents user preferences for personalized recommendations.
/// </summary>
public class UserPreferences
{
    public Guid Id { get; set; }
    public required string UserId { get; set; }
    public string? PreferredGenres { get; set; }
    public string? PreferredThemes { get; set; }
    public string? FavoriteAuthors { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? UpdatedDate { get; set; }
    
    // Navigation property
    public ApplicationUser User { get; set; } = null!;
}
