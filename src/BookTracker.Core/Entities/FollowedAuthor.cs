namespace BookTracker.Core.Entities;

/// <summary>
/// Tracks a user's interest in a specific author for updates and alerts.
/// </summary>
public class FollowedAuthor
{
    public Guid Id { get; set; }
    public required string UserId { get; set; }
    public required string AuthorName { get; set; }
    public DateTime StartedFollowingAt { get; set; }
    public bool AlertsEnabled { get; set; } = true;

    // Navigation properties
    public ApplicationUser? Follower { get; set; }
}
