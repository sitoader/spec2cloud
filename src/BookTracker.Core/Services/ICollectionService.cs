using BookTracker.Core.Entities;

namespace BookTracker.Core.Services;

/// <summary>
/// Contract for book collection management operations.
/// </summary>
public interface ICollectionService
{
    /// <summary>Gets all collections for a user.</summary>
    Task<IEnumerable<Collection>> GetUserCollectionsAsync(string userId);

    /// <summary>Gets a collection by id.</summary>
    Task<Collection> GetCollectionAsync(string userId, Guid collectionId);

    /// <summary>Creates a new collection.</summary>
    Task<Collection> CreateCollectionAsync(string userId, string name, string? description, bool isPublic);

    /// <summary>Updates a collection.</summary>
    Task<Collection> UpdateCollectionAsync(string userId, Guid collectionId, string? name, string? description, bool? isPublic);

    /// <summary>Deletes a collection.</summary>
    Task DeleteCollectionAsync(string userId, Guid collectionId);

    /// <summary>Adds a book to a collection.</summary>
    Task<CollectionBook> AddBookToCollectionAsync(string userId, Guid collectionId, Guid bookId, string? notes);

    /// <summary>Removes a book from a collection.</summary>
    Task RemoveBookFromCollectionAsync(string userId, Guid collectionId, Guid bookId);

    /// <summary>Gets public collections with optional search.</summary>
    Task<IEnumerable<Collection>> GetPublicCollectionsAsync(string? search);
}
