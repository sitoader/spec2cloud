namespace BookTracker.Api.Models.Progress;

/// <summary>
/// Data transfer object representing a user's reading streak.
/// </summary>
public class ReadingStreakDto
{
    public int CurrentStreak { get; set; }
    public int LongestStreak { get; set; }
    public DateTime? LastReadDate { get; set; }
}
