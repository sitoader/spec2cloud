using System.ComponentModel.DataAnnotations;

namespace BookTracker.Api.Models.Authors;

/// <summary>
/// Request model for following an author.
/// </summary>
public record FollowAuthorRequest
{
    /// <summary>Gets the author name.</summary>
    [Required, MaxLength(200)]
    public string AuthorName { get; init; } = default!;

    /// <summary>Gets whether notifications are enabled.</summary>
    public bool NotificationsEnabled { get; init; }
}
