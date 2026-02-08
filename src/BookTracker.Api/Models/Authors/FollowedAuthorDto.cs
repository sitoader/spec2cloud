namespace BookTracker.Api.Models.Authors;

/// <summary>
/// Data transfer object representing a followed author.
/// </summary>
public class FollowedAuthorDto
{
    public Guid Id { get; set; }
    public string AuthorName { get; set; } = default!;
    public DateTime FollowedAt { get; set; }
    public bool NotificationsEnabled { get; set; }
}
