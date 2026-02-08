using System.ComponentModel.DataAnnotations;

namespace BookTracker.Api.Models.Goals;

/// <summary>
/// Request model for updating a reading goal.
/// </summary>
public record UpdateGoalRequest
{
    /// <summary>Gets the target number of books.</summary>
    [Required, Range(1, 1000)]
    public int TargetBooksCount { get; init; }
}
