using System.ComponentModel.DataAnnotations;

namespace BookTracker.Api.Models.Books;

/// <summary>
/// Request model for adding or updating a book rating.
/// </summary>
public record AddRatingRequest
{
    /// <summary>Gets the rating score (1-5).</summary>
    [Required, Range(1, 5)]
    public int Score { get; init; }

    /// <summary>Gets optional review notes.</summary>
    [MaxLength(1000)]
    public string? Notes { get; init; }
}
