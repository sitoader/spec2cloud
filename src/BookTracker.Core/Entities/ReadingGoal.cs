namespace BookTracker.Core.Entities;

/// <summary>
/// Represents an annual reading goal for a user.
/// </summary>
public class ReadingGoal
{
    public Guid Id { get; set; }
    public required string UserId { get; set; }
    public int Year { get; set; }
    public int TargetBooksCount { get; set; }
    public int CompletedBooksCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation property
    public ApplicationUser? User { get; set; }
}
