using System.ComponentModel.DataAnnotations;

namespace BookTracker.Api.Models.Reviews;

/// <summary>Request model for creating a review.</summary>
public record CreateReviewRequest
{
    [Required] public Guid BookId { get; init; }
    [Required, Range(1, 5)] public int Rating { get; init; }
    [MaxLength(10000)] public string? ReviewText { get; init; }
    [MaxLength(20000)] public string? ReviewHtml { get; init; }
    public bool IsPublic { get; init; } = true;
    public string[]? Tags { get; init; }
    [MaxLength(50)] public string? Mood { get; init; }
    public bool? WouldRecommend { get; init; }
}

/// <summary>Request model for updating a review.</summary>
public record UpdateReviewRequest
{
    [Range(1, 5)] public int? Rating { get; init; }
    [MaxLength(10000)] public string? ReviewText { get; init; }
    [MaxLength(20000)] public string? ReviewHtml { get; init; }
    public bool? IsPublic { get; init; }
    public string[]? Tags { get; init; }
    [MaxLength(50)] public string? Mood { get; init; }
    public bool? WouldRecommend { get; init; }
}

/// <summary>DTO for a book review.</summary>
public record BookReviewDto
{
    public Guid Id { get; init; }
    public string UserId { get; init; } = string.Empty;
    public Guid BookId { get; init; }
    public int Rating { get; init; }
    public string? ReviewText { get; init; }
    public string? ReviewHtml { get; init; }
    public bool IsPublic { get; init; }
    public string[]? Tags { get; init; }
    public string? Mood { get; init; }
    public bool? WouldRecommend { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}
