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

    /// <summary>Book description from external catalogue.</summary>
    public string? Description { get; init; }

    /// <summary>Cover image URL from external catalogue.</summary>
    public string? CoverImageUrl { get; init; }

    /// <summary>ISBN from external catalogue.</summary>
    public string? Isbn { get; init; }

    /// <summary>Publication year from external catalogue.</summary>
    public int? PublicationYear { get; init; }

    /// <summary>Genres from external catalogue.</summary>
    public string[]? Genres { get; init; }

    /// <summary>External catalogue source (e.g. "google-books").</summary>
    public string? Source { get; init; }
}
