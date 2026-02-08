using System.ComponentModel.DataAnnotations;

namespace BookTracker.Api.Models.Authors;

/// <summary>Request model for following an author.</summary>
public record FollowAuthorRequest
{
    [Required, MaxLength(200)] public string AuthorName { get; init; } = string.Empty;
    public bool NotificationsEnabled { get; init; } = true;
}

/// <summary>DTO for a followed author.</summary>
public record FollowedAuthorDto
{
    public Guid Id { get; init; }
    public string AuthorName { get; init; } = string.Empty;
    public DateTime FollowedAt { get; init; }
    public bool NotificationsEnabled { get; init; }
}
