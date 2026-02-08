using System.ComponentModel.DataAnnotations;

namespace BookTracker.Api.Models.Goals;

/// <summary>
/// Request model for creating a reading goal.
/// </summary>
public record CreateGoalRequest
{
    /// <summary>Gets the target year.</summary>
    [Required, Range(2000, 2100)]
    public int Year { get; init; }

    /// <summary>Gets the target number of books.</summary>
    [Required, Range(1, 1000)]
    public int TargetBooksCount { get; init; }
}
