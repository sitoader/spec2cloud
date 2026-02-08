using BookTracker.Core.Entities;

namespace BookTracker.Core.Repositories;

/// <summary>
/// Contract for followed author data access operations.
/// </summary>
public interface IFollowedAuthorRepository
{
    /// <summary>Gets all authors followed by a given owner.</summary>
    Task<IEnumerable<FollowedAuthor>> FetchByOwnerAsync(string ownerId);

    /// <summary>Gets a follow record for a given owner and author name.</summary>
    Task<FollowedAuthor?> FindByOwnerAndAuthorAsync(string ownerId, string authorName);

    /// <summary>Persists a new followed author record.</summary>
    Task PersistAsync(FollowedAuthor entity);

    /// <summary>Removes a followed author by owner and author name.</summary>
    Task RemoveAsync(string ownerId, string authorName);
}
