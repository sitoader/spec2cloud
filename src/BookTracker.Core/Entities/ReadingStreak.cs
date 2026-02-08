namespace BookTracker.Core.Entities;

/// <summary>
/// Maintains a record of consecutive daily reading activity for a user.
/// </summary>
public class ReadingStreak
{
    public Guid Id { get; set; }
    public required string UserId { get; set; }
    public int ActiveStreakDays { get; set; }
    public int BestStreakDays { get; set; }
    public DateTime? MostRecentReadDate { get; set; }
    public DateTime TrackedSince { get; set; }
    public DateTime ModifiedAt { get; set; }

    // Navigation properties
    public ApplicationUser? Owner { get; set; }
}
