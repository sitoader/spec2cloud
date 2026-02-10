using BookTracker.Core.Entities;

namespace BookTracker.Core.Repositories;

/// <summary>
/// Contract for collection data access operations.
/// </summary>
public interface ICollectionRepository
{
    /// <summary>Gets all collections owned by a given owner.</summary>
    Task<IEnumerable<Collection>> FetchByOwnerAsync(string ownerId);

    /// <summary>Gets a single collection by its id.</summary>
    Task<Collection?> FindByIdAsync(Guid collectionId);

    /// <summary>Persists a new collection.</summary>
    Task PersistAsync(Collection entity);

    /// <summary>Updates an existing collection.</summary>
    Task ModifyAsync(Collection entity);

    /// <summary>Removes a collection by its id.</summary>
    Task RemoveAsync(Guid collectionId);

    /// <summary>Attaches a book to a collection.</summary>
    Task AttachBookAsync(CollectionBook link);

    /// <summary>Detaches a book from a collection.</summary>
    Task DetachBookAsync(Guid collectionId, Guid bookId);

    /// <summary>Gets all visible collections, optionally filtered by a search term.</summary>
    Task<IEnumerable<Collection>> FetchVisibleAsync(string? searchTerm);

    /// <summary>Gets all collections owned by a given owner that contain a specific book.</summary>
    Task<IEnumerable<Collection>> FetchByBookAsync(string ownerId, Guid bookId);
}
