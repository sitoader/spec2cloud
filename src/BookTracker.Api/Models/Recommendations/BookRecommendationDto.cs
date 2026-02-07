namespace BookTracker.Api.Models.Recommendations;

/// <summary>
/// Represents a single AI-generated book recommendation.
/// </summary>
public record BookRecommendationDto
{
    /// <summary>Recommended book title.</summary>
    public required string Title { get; init; }

    /// <summary>Recommended book author.</summary>
    public required string Author { get; init; }

    /// <summary>Genre of the recommended book.</summary>
    public string? Genre { get; init; }

    /// <summary>Reason why this book was recommended.</summary>
    public required string Reason { get; init; }

    /// <summary>Confidence score from 1 (low) to 5 (high).</summary>
    public int ConfidenceScore { get; init; }
}
