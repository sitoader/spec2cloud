namespace BookTracker.Api.Models.Goals;

/// <summary>
/// Data transfer object representing a reading goal.
/// </summary>
public class ReadingGoalDto
{
    public Guid Id { get; set; }
    public int Year { get; set; }
    public int TargetBooksCount { get; set; }
    public int CompletedBooksCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
