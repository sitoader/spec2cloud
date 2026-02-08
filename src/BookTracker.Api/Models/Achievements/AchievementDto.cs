namespace BookTracker.Api.Models.Achievements;

/// <summary>
/// Data transfer object representing an achievement badge.
/// </summary>
public class AchievementDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public string? IconUrl { get; set; }
    public string? Category { get; set; }
    public int? RequirementValue { get; set; }
}
