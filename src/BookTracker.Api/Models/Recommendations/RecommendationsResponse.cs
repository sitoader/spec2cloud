namespace BookTracker.Api.Models.Recommendations;

/// <summary>
/// Response payload containing AI-generated book recommendations.
/// </summary>
public record RecommendationsResponse
{
    /// <summary>List of recommended books.</summary>
    public required List<BookRecommendationDto> Recommendations { get; init; }

    /// <summary>Timestamp when recommendations were generated.</summary>
    public required DateTime GeneratedAt { get; init; }

    /// <summary>Number of books from user's library analyzed to produce recommendations.</summary>
    public required int BooksAnalyzed { get; init; }
}
