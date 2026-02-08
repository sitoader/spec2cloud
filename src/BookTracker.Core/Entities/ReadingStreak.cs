namespace BookTracker.Core.Entities;

/// <summary>
/// Tracks user reading streaks.
/// </summary>
public class ReadingStreak
{
    public Guid Id { get; set; }
    public required string UserId { get; set; }
    public int CurrentStreak { get; set; }
    public int LongestStreak { get; set; }
    public DateTime? LastReadDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation property
    public ApplicationUser? User { get; set; }
}
