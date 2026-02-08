namespace BookTracker.Core.Entities;

/// <summary>
/// Links a user to a badge they have earned.
/// </summary>
public class UserAchievement
{
    public Guid Id { get; set; }
    public required string UserId { get; set; }
    public Guid AchievementId { get; set; }
    public DateTime EarnedAt { get; set; }

    // Navigation properties
    public ApplicationUser? Owner { get; set; }
    public Achievement? Badge { get; set; }
}
