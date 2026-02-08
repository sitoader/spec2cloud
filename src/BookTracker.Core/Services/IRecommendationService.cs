namespace BookTracker.Core.Services;

/// <summary>
/// Result of an AI recommendation generation.
/// </summary>
public record RecommendationResult
{
    public required string Title { get; init; }
    public required string Author { get; init; }
    public string? Genre { get; init; }
    public required string Reason { get; init; }
    public int ConfidenceScore { get; init; }

    // Enrichment fields from external catalogue lookup
    public string? Description { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? Isbn { get; set; }
    public int? PublicationYear { get; set; }
    public string[]? Genres { get; set; }
    public string? Source { get; set; }
}

/// <summary>
/// Encapsulates the full response from recommendation generation.
/// </summary>
public record RecommendationGenerationResult
{
    public required List<RecommendationResult> Recommendations { get; init; }
    public required DateTime GeneratedAt { get; init; }
    public required int BooksAnalyzed { get; init; }
}

/// <summary>
/// Contract for AI-powered book recommendation operations.
/// </summary>
public interface IRecommendationService
{
    /// <summary>Generates personalized book recommendations for a user.</summary>
    Task<RecommendationGenerationResult> GenerateRecommendationsAsync(string userId, int count);

    /// <summary>Validates that the user has sufficient data (≥3 rated books) for recommendations.</summary>
    Task<bool> ValidateUserDataAsync(string userId);
}
