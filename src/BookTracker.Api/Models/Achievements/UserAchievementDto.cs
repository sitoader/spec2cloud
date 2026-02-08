namespace BookTracker.Api.Models.Achievements;

/// <summary>
/// Data transfer object representing a user's earned achievement.
/// </summary>
public class UserAchievementDto
{
    public Guid Id { get; set; }
    public Guid AchievementId { get; set; }
    public AchievementDto? Achievement { get; set; }
    public DateTime UnlockedAt { get; set; }
}
