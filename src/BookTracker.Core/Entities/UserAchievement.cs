namespace BookTracker.Core.Entities;

/// <summary>
/// Tracks achievements unlocked by a user.
/// </summary>
public class UserAchievement
{
    public Guid Id { get; set; }
    public required string UserId { get; set; }
    public Guid AchievementId { get; set; }
    public DateTime UnlockedAt { get; set; }

    // Navigation properties
    public ApplicationUser? User { get; set; }
    public Achievement? Achievement { get; set; }
}
