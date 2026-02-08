namespace BookTracker.Core.Entities;

/// <summary>
/// Represents a user following an author.
/// </summary>
public class FollowedAuthor
{
    public Guid Id { get; set; }
    public required string UserId { get; set; }
    public required string AuthorName { get; set; }
    public DateTime FollowedAt { get; set; }
    public bool NotificationsEnabled { get; set; }

    // Navigation property
    public ApplicationUser? User { get; set; }
}
