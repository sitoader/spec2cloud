using BookTracker.Core.Entities;

namespace BookTracker.Core.Repositories;

/// <summary>
/// Contract for followed author data access operations.
/// </summary>
public interface IFollowedAuthorRepository
{
    /// <summary>Gets all authors followed by a user.</summary>
    Task<IEnumerable<FollowedAuthor>> GetByUserIdAsync(string userId);

    /// <summary>Gets a specific followed author entry.</summary>
    Task<FollowedAuthor?> GetByUserAndAuthorAsync(string userId, string authorName);

    /// <summary>Adds a new followed author.</summary>
    Task AddAsync(FollowedAuthor followedAuthor);

    /// <summary>Removes a followed author.</summary>
    Task DeleteAsync(Guid followedAuthorId);
}
