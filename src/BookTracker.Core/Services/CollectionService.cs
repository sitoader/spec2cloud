using BookTracker.Core.Entities;
using BookTracker.Core.Repositories;
using Microsoft.Extensions.Logging;

namespace BookTracker.Core.Services;

/// <summary>
/// Orchestrates book collection management operations with ownership validation.
/// </summary>
public class CollectionService : ICollectionService
{
    private readonly ICollectionRepository _collectionRepo;
    private readonly ILogger<CollectionService> _logger;

    public CollectionService(ICollectionRepository collectionRepo, ILogger<CollectionService> logger)
    {
        _collectionRepo = collectionRepo;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<IEnumerable<Collection>> ListOwnerCollectionsAsync(string ownerId)
    {
        return await _collectionRepo.FetchByOwnerAsync(ownerId);
    }

    /// <inheritdoc />
    public async Task<Collection?> FetchCollectionAsync(Guid collectionId)
    {
        return await _collectionRepo.FindByIdAsync(collectionId);
    }

    /// <inheritdoc />
    public async Task<Collection> CreateCollectionAsync(string ownerId, string label, string? summary, bool isVisible)
    {
        if (string.IsNullOrWhiteSpace(label))
            throw new ArgumentException("Collection label must not be empty.");

        var collection = new Collection
        {
            Id = Guid.NewGuid(),
            UserId = ownerId,
            Label = label.Trim(),
            Summary = summary?.Trim(),
            IsVisible = isVisible,
            SetAt = DateTime.UtcNow,
            ModifiedAt = DateTime.UtcNow
        };

        await _collectionRepo.PersistAsync(collection);
        _logger.LogInformation("Collection created {CollectionId} by owner {OwnerId}", collection.Id, ownerId);
        return collection;
    }

    /// <inheritdoc />
    public async Task<Collection> ReviseCollectionAsync(string ownerId, Guid collectionId, string label, string? summary, bool isVisible)
    {
        if (string.IsNullOrWhiteSpace(label))
            throw new ArgumentException("Collection label must not be empty.");

        var existing = await _collectionRepo.FindByIdAsync(collectionId);
        if (existing is null)
            throw new KeyNotFoundException($"Collection {collectionId} not found.");

        if (existing.UserId != ownerId)
            throw new UnauthorizedAccessException("You do not own this collection.");

        existing.Label = label.Trim();
        existing.Summary = summary?.Trim();
        existing.IsVisible = isVisible;
        existing.ModifiedAt = DateTime.UtcNow;
        await _collectionRepo.ModifyAsync(existing);

        _logger.LogInformation("Collection revised {CollectionId} by owner {OwnerId}", collectionId, ownerId);
        return existing;
    }

    /// <inheritdoc />
    public async Task RemoveCollectionAsync(string ownerId, Guid collectionId)
    {
        var existing = await _collectionRepo.FindByIdAsync(collectionId);
        if (existing is null)
            throw new KeyNotFoundException($"Collection {collectionId} not found.");

        if (existing.UserId != ownerId)
            throw new UnauthorizedAccessException("You do not own this collection.");

        await _collectionRepo.RemoveAsync(collectionId);
        _logger.LogInformation("Collection removed {CollectionId} by owner {OwnerId}", collectionId, ownerId);
    }

    /// <inheritdoc />
    public async Task<CollectionBook> AttachBookAsync(string ownerId, Guid collectionId, Guid bookId, string? annotation)
    {
        var collection = await _collectionRepo.FindByIdAsync(collectionId);
        if (collection is null)
            throw new KeyNotFoundException($"Collection {collectionId} not found.");

        if (collection.UserId != ownerId)
            throw new UnauthorizedAccessException("You do not own this collection.");

        var link = new CollectionBook
        {
            Id = Guid.NewGuid(),
            CollectionId = collectionId,
            BookId = bookId,
            IncludedAt = DateTime.UtcNow,
            Annotation = annotation
        };

        await _collectionRepo.AttachBookAsync(link);
        _logger.LogInformation("Book {BookId} attached to collection {CollectionId}", bookId, collectionId);
        return link;
    }

    /// <inheritdoc />
    public async Task<IEnumerable<Collection>> ListCollectionsForBookAsync(string ownerId, Guid bookId)
    {
        return await _collectionRepo.FetchByBookAsync(ownerId, bookId);
    }

    /// <inheritdoc />
    public async Task DetachBookAsync(string ownerId, Guid collectionId, Guid bookId)
    {
        var collection = await _collectionRepo.FindByIdAsync(collectionId);
        if (collection is null)
            throw new KeyNotFoundException($"Collection {collectionId} not found.");

        if (collection.UserId != ownerId)
            throw new UnauthorizedAccessException("You do not own this collection.");

        await _collectionRepo.DetachBookAsync(collectionId, bookId);
        _logger.LogInformation("Book {BookId} detached from collection {CollectionId}", bookId, collectionId);
    }

    /// <inheritdoc />
    public async Task<IEnumerable<Collection>> BrowseVisibleCollectionsAsync(string? searchTerm)
    {
        return await _collectionRepo.FetchVisibleAsync(searchTerm);
    }
}
