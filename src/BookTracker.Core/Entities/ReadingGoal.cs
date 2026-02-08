namespace BookTracker.Core.Entities;

/// <summary>
/// Represents an annual reading target set by a user.
/// </summary>
public class ReadingGoal
{
    public Guid Id { get; set; }
    public required string UserId { get; set; }
    public int TargetYear { get; set; }
    public int TargetBookCount { get; set; }
    public int FinishedBookCount { get; set; }
    public DateTime SetAt { get; set; }
    public DateTime ModifiedAt { get; set; }

    // Navigation properties
    public ApplicationUser? Owner { get; set; }
}
