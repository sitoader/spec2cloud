namespace BookTracker.Core.Entities;

/// <summary>
/// Represents an achievement definition.
/// </summary>
public class Achievement
{
    public Guid Id { get; set; }
    public required string Code { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public string? IconUrl { get; set; }
    public string? Category { get; set; }
    public int? RequirementValue { get; set; }

    // Navigation property
    public ICollection<UserAchievement> UserAchievements { get; set; } = new List<UserAchievement>();
}
