using BookTracker.Core.Entities;

namespace BookTracker.Core.Services;

/// <summary>
/// Contract for book collection management operations.
/// </summary>
public interface ICollectionService
{
    /// <summary>Lists all collections owned by the specified owner.</summary>
    Task<IEnumerable<Collection>> ListOwnerCollectionsAsync(string ownerId);

    /// <summary>Fetches a collection by its identifier.</summary>
    Task<Collection?> FetchCollectionAsync(Guid collectionId);

    /// <summary>Creates a new collection.</summary>
    Task<Collection> CreateCollectionAsync(string ownerId, string label, string? summary, bool isVisible);

    /// <summary>Revises an existing collection.</summary>
    Task<Collection> ReviseCollectionAsync(string ownerId, Guid collectionId, string label, string? summary, bool isVisible);

    /// <summary>Removes a collection.</summary>
    Task RemoveCollectionAsync(string ownerId, Guid collectionId);

    /// <summary>Attaches a book to a collection.</summary>
    Task<CollectionBook> AttachBookAsync(string ownerId, Guid collectionId, Guid bookId, string? annotation);

    /// <summary>Detaches a book from a collection.</summary>
    Task DetachBookAsync(string ownerId, Guid collectionId, Guid bookId);

    /// <summary>Browses publicly visible collections, optionally filtered by search term.</summary>
    Task<IEnumerable<Collection>> BrowseVisibleCollectionsAsync(string? searchTerm);

    /// <summary>Lists collections owned by the specified owner that contain a given book.</summary>
    Task<IEnumerable<Collection>> ListCollectionsForBookAsync(string ownerId, Guid bookId);
}
