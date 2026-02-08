namespace BookTracker.Core.Entities;

/// <summary>
/// Defines a gamification badge that users can earn.
/// </summary>
public class Achievement
{
    public Guid Id { get; set; }
    public required string Slug { get; set; }
    public required string DisplayName { get; set; }
    public string? Summary { get; set; }
    public string? BadgeImageUrl { get; set; }
    public string? AchievementCategory { get; set; }
    public int? ThresholdValue { get; set; }

    // Navigation properties
    public ICollection<UserAchievement> Holders { get; set; } = new List<UserAchievement>();
}
