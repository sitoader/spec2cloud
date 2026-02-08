using System.ComponentModel.DataAnnotations;

namespace BookTracker.Api.Models.Goals;

/// <summary>Request model for setting a reading goal.</summary>
public record SetReadingGoalRequest
{
    [Required] public int Year { get; init; }
    [Required, Range(1, 1000)] public int TargetBooksCount { get; init; }
}

/// <summary>DTO for reading goal.</summary>
public record ReadingGoalDto
{
    public Guid Id { get; init; }
    public int Year { get; init; }
    public int TargetBooksCount { get; init; }
    public int CompletedBooksCount { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

/// <summary>DTO for achievement.</summary>
public record AchievementDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? IconUrl { get; init; }
    public string? Category { get; init; }
    public int? RequirementValue { get; init; }
}

/// <summary>DTO for user achievement.</summary>
public record UserAchievementDto
{
    public Guid Id { get; init; }
    public AchievementDto? Achievement { get; init; }
    public DateTime UnlockedAt { get; init; }
}
