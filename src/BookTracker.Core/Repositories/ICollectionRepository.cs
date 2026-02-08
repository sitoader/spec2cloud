using BookTracker.Core.Entities;

namespace BookTracker.Core.Repositories;

/// <summary>
/// Contract for collection data access operations.
/// </summary>
public interface ICollectionRepository
{
    /// <summary>Gets all collections for a user.</summary>
    Task<IEnumerable<Collection>> GetByUserIdAsync(string userId);

    /// <summary>Gets a collection by id.</summary>
    Task<Collection?> GetByIdAsync(Guid collectionId);

    /// <summary>Gets public collections with optional search.</summary>
    Task<IEnumerable<Collection>> GetPublicAsync(string? search);

    /// <summary>Adds a new collection.</summary>
    Task AddAsync(Collection collection);

    /// <summary>Updates an existing collection.</summary>
    Task UpdateAsync(Collection collection);

    /// <summary>Deletes a collection.</summary>
    Task DeleteAsync(Guid collectionId);

    /// <summary>Adds a book to a collection.</summary>
    Task AddBookAsync(CollectionBook collectionBook);

    /// <summary>Removes a book from a collection.</summary>
    Task RemoveBookAsync(Guid collectionId, Guid bookId);

    /// <summary>Gets a collection book entry.</summary>
    Task<CollectionBook?> GetCollectionBookAsync(Guid collectionId, Guid bookId);
}
