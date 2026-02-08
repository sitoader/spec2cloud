using System.ComponentModel.DataAnnotations;

namespace BookTracker.Api.Models.ReadingProgress;

/// <summary>Request model for logging a reading session.</summary>
public record LogReadingSessionRequest
{
    [Required] public Guid BookId { get; init; }
    [Required] public DateTime StartTime { get; init; }
    public DateTime? EndTime { get; init; }
    public int? PagesRead { get; init; }
    public int? CurrentPage { get; init; }
    [MaxLength(2000)] public string? Notes { get; init; }
}

/// <summary>Request model for updating reading progress.</summary>
public record UpdateReadingProgressRequest
{
    [Required] public int CurrentPage { get; init; }
    public int? TotalPages { get; init; }
}

/// <summary>DTO for reading session.</summary>
public record ReadingSessionDto
{
    public Guid Id { get; init; }
    public Guid BookId { get; init; }
    public DateTime StartTime { get; init; }
    public DateTime? EndTime { get; init; }
    public int? PagesRead { get; init; }
    public int? CurrentPage { get; init; }
    public string? Notes { get; init; }
    public DateTime CreatedAt { get; init; }
}

/// <summary>DTO for reading progress.</summary>
public record ReadingProgressDto
{
    public Guid Id { get; init; }
    public Guid BookId { get; init; }
    public int? TotalPages { get; init; }
    public int CurrentPage { get; init; }
    public decimal ProgressPercentage { get; init; }
    public DateTime? EstimatedCompletionDate { get; init; }
    public DateTime LastUpdated { get; init; }
}

/// <summary>DTO for reading streak.</summary>
public record ReadingStreakDto
{
    public int CurrentStreak { get; init; }
    public int LongestStreak { get; init; }
    public DateTime? LastReadDate { get; init; }
}
