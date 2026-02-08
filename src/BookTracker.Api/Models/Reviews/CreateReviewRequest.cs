using System.ComponentModel.DataAnnotations;

namespace BookTracker.Api.Models.Reviews;

/// <summary>
/// Request model for creating a book review.
/// </summary>
public record CreateReviewRequest
{
    /// <summary>Gets the book identifier.</summary>
    [Required]
    public Guid BookId { get; init; }

    /// <summary>Gets the rating score (1-5).</summary>
    [Required, Range(1, 5)]
    public int Rating { get; init; }

    /// <summary>Gets the optional plain text review.</summary>
    public string? ReviewText { get; init; }

    /// <summary>Gets the optional HTML-formatted review.</summary>
    public string? ReviewHtml { get; init; }

    /// <summary>Gets whether the review is public.</summary>
    public bool IsPublic { get; init; }

    /// <summary>Gets optional tags.</summary>
    public string[]? Tags { get; init; }

    /// <summary>Gets the optional reading mood.</summary>
    [MaxLength(50)]
    public string? Mood { get; init; }

    /// <summary>Gets whether the reviewer would recommend the book.</summary>
    public bool? WouldRecommend { get; init; }
}
