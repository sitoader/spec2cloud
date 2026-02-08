using BookTracker.Core.Entities;

namespace BookTracker.Core.Services;

/// <summary>
/// Contract for author following management operations.
/// </summary>
public interface IAuthorFollowService
{
    /// <summary>Follows an author.</summary>
    Task<FollowedAuthor> FollowAuthorAsync(string userId, string authorName, bool notificationsEnabled);

    /// <summary>Unfollows an author.</summary>
    Task UnfollowAuthorAsync(string userId, string authorName);

    /// <summary>Gets all authors followed by a user.</summary>
    Task<IEnumerable<FollowedAuthor>> GetFollowedAuthorsAsync(string userId);
}
