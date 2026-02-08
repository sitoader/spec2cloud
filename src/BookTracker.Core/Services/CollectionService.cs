using BookTracker.Core.Entities;
using BookTracker.Core.Exceptions;
using BookTracker.Core.Repositories;
using Microsoft.Extensions.Logging;

namespace BookTracker.Core.Services;

/// <summary>
/// Orchestrates book collection operations.
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
    public async Task<IEnumerable<Collection>> GetUserCollectionsAsync(string userId)
    {
        return await _collectionRepo.GetByUserIdAsync(userId);
    }

    /// <inheritdoc />
    public async Task<Collection> GetCollectionAsync(string userId, Guid collectionId)
    {
        var collection = await _collectionRepo.GetByIdAsync(collectionId);
        if (collection is null)
            throw new CollectionNotFoundException();
        if (collection.UserId != userId && !collection.IsPublic)
            throw new CollectionAccessDeniedException();
        return collection;
    }

    /// <inheritdoc />
    public async Task<Collection> CreateCollectionAsync(string userId, string name, string? description, bool isPublic)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Collection name is required.");

        var collection = new Collection
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = name,
            Description = description,
            IsPublic = isPublic,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _collectionRepo.AddAsync(collection);
        _logger.LogInformation("Collection created {CollectionId} by user {UserId}", collection.Id, userId);
        return collection;
    }

    /// <inheritdoc />
    public async Task<Collection> UpdateCollectionAsync(string userId, Guid collectionId, string? name, string? description, bool? isPublic)
    {
        var collection = await _collectionRepo.GetByIdAsync(collectionId);
        if (collection is null)
            throw new CollectionNotFoundException();
        if (collection.UserId != userId)
            throw new CollectionAccessDeniedException();

        if (name is not null) collection.Name = name;
        if (description is not null) collection.Description = description;
        if (isPublic.HasValue) collection.IsPublic = isPublic.Value;
        collection.UpdatedAt = DateTime.UtcNow;

        await _collectionRepo.UpdateAsync(collection);
        _logger.LogInformation("Collection updated {CollectionId} by user {UserId}", collectionId, userId);
        return collection;
    }

    /// <inheritdoc />
    public async Task DeleteCollectionAsync(string userId, Guid collectionId)
    {
        var collection = await _collectionRepo.GetByIdAsync(collectionId);
        if (collection is null)
            throw new CollectionNotFoundException();
        if (collection.UserId != userId)
            throw new CollectionAccessDeniedException();

        await _collectionRepo.DeleteAsync(collectionId);
        _logger.LogInformation("Collection deleted {CollectionId} by user {UserId}", collectionId, userId);
    }

    /// <inheritdoc />
    public async Task<CollectionBook> AddBookToCollectionAsync(string userId, Guid collectionId, Guid bookId, string? notes)
    {
        var collection = await _collectionRepo.GetByIdAsync(collectionId);
        if (collection is null)
            throw new CollectionNotFoundException();
        if (collection.UserId != userId)
            throw new CollectionAccessDeniedException();

        var existing = await _collectionRepo.GetCollectionBookAsync(collectionId, bookId);
        if (existing is not null)
            throw new ArgumentException("Book is already in this collection.");

        var collectionBook = new CollectionBook
        {
            Id = Guid.NewGuid(),
            CollectionId = collectionId,
            BookId = bookId,
            AddedAt = DateTime.UtcNow,
            Notes = notes
        };

        await _collectionRepo.AddBookAsync(collectionBook);
        _logger.LogInformation("Book {BookId} added to collection {CollectionId}", bookId, collectionId);
        return collectionBook;
    }

    /// <inheritdoc />
    public async Task RemoveBookFromCollectionAsync(string userId, Guid collectionId, Guid bookId)
    {
        var collection = await _collectionRepo.GetByIdAsync(collectionId);
        if (collection is null)
            throw new CollectionNotFoundException();
        if (collection.UserId != userId)
            throw new CollectionAccessDeniedException();

        await _collectionRepo.RemoveBookAsync(collectionId, bookId);
        _logger.LogInformation("Book {BookId} removed from collection {CollectionId}", bookId, collectionId);
    }

    /// <inheritdoc />
    public async Task<IEnumerable<Collection>> GetPublicCollectionsAsync(string? search)
    {
        return await _collectionRepo.GetPublicAsync(search);
    }
}
