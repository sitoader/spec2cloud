using BookTracker.Core.Entities;

namespace BookTracker.Core.Services;

/// <summary>
/// Contract for author follow and tracking operations.
/// </summary>
public interface IAuthorFollowService
{
    /// <summary>Starts following an author.</summary>
    Task<FollowedAuthor> StartFollowingAsync(string ownerId, string authorName, bool alertsEnabled);

    /// <summary>Stops following an author.</summary>
    Task StopFollowingAsync(string ownerId, string authorName);

    /// <summary>Lists all authors followed by the specified owner.</summary>
    Task<IEnumerable<FollowedAuthor>> ListFollowedAsync(string ownerId);

    /// <summary>Fetches the library of books by a followed author.</summary>
    Task<IEnumerable<Book>> FetchAuthorLibraryAsync(string ownerId, string authorName);
}
