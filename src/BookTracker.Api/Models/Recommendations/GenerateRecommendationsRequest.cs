using System.ComponentModel.DataAnnotations;

namespace BookTracker.Api.Models.Recommendations;

/// <summary>
/// Request payload for generating AI-powered book recommendations.
/// </summary>
public record GenerateRecommendationsRequest
{
    /// <summary>Number of recommendations to generate (1-10, default 5).</summary>
    [Range(1, 10)]
    public int Count { get; init; } = 5;
}
