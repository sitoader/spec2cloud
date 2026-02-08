using BookTracker.Core.Entities;
using BookTracker.Core.Exceptions;
using BookTracker.Core.Repositories;
using BookTracker.Core.Services;
using Microsoft.Extensions.Logging;
using NSubstitute;
using NSubstitute.ReturnsExtensions;

namespace BookTracker.Core.Tests.Services;

/// <summary>
/// Unit tests for <see cref="CollectionService"/>.
/// </summary>
public class CollectionServiceTests
{
    private readonly ICollectionRepository _collectionRepo;
    private readonly CollectionService _svc;
    private const string UserId = "user-1";

    public CollectionServiceTests()
    {
        _collectionRepo = Substitute.For<ICollectionRepository>();
        var logger = Substitute.For<ILogger<CollectionService>>();
        _svc = new CollectionService(_collectionRepo, logger);
    }

    [Fact]
    public async Task CreateCollectionAsync_CreatesCollection()
    {
        var result = await _svc.CreateCollectionAsync(UserId, "My List", "Description", false);

        Assert.Equal("My List", result.Name);
        Assert.Equal("Description", result.Description);
        Assert.False(result.IsPublic);
        await _collectionRepo.Received(1).AddAsync(Arg.Any<Collection>());
    }

    [Fact]
    public async Task CreateCollectionAsync_ThrowsArgException_WhenNameEmpty()
    {
        await Assert.ThrowsAsync<ArgumentException>(
            () => _svc.CreateCollectionAsync(UserId, "", null, false));
    }

    [Fact]
    public async Task GetCollectionAsync_ReturnsCollection_WhenOwner()
    {
        var collection = new Collection { Id = Guid.NewGuid(), UserId = UserId, Name = "Test", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        _collectionRepo.GetByIdAsync(collection.Id).Returns(collection);

        var result = await _svc.GetCollectionAsync(UserId, collection.Id);

        Assert.Equal("Test", result.Name);
    }

    [Fact]
    public async Task GetCollectionAsync_ThrowsNotFound_WhenNoCollection()
    {
        _collectionRepo.GetByIdAsync(Arg.Any<Guid>()).ReturnsNull();

        await Assert.ThrowsAsync<CollectionNotFoundException>(
            () => _svc.GetCollectionAsync(UserId, Guid.NewGuid()));
    }

    [Fact]
    public async Task GetCollectionAsync_ThrowsAccessDenied_WhenNotOwnerAndPrivate()
    {
        var collection = new Collection { Id = Guid.NewGuid(), UserId = "other-user", Name = "Private", IsPublic = false, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        _collectionRepo.GetByIdAsync(collection.Id).Returns(collection);

        await Assert.ThrowsAsync<CollectionAccessDeniedException>(
            () => _svc.GetCollectionAsync(UserId, collection.Id));
    }

    [Fact]
    public async Task GetCollectionAsync_AllowsAccess_WhenPublic()
    {
        var collection = new Collection { Id = Guid.NewGuid(), UserId = "other-user", Name = "Public", IsPublic = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        _collectionRepo.GetByIdAsync(collection.Id).Returns(collection);

        var result = await _svc.GetCollectionAsync(UserId, collection.Id);

        Assert.Equal("Public", result.Name);
    }

    [Fact]
    public async Task DeleteCollectionAsync_Deletes_WhenOwner()
    {
        var collection = new Collection { Id = Guid.NewGuid(), UserId = UserId, Name = "Test", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        _collectionRepo.GetByIdAsync(collection.Id).Returns(collection);

        await _svc.DeleteCollectionAsync(UserId, collection.Id);

        await _collectionRepo.Received(1).DeleteAsync(collection.Id);
    }

    [Fact]
    public async Task AddBookToCollectionAsync_AddsBook()
    {
        var collectionId = Guid.NewGuid();
        var bookId = Guid.NewGuid();
        var collection = new Collection { Id = collectionId, UserId = UserId, Name = "Test", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        _collectionRepo.GetByIdAsync(collectionId).Returns(collection);
        _collectionRepo.GetCollectionBookAsync(collectionId, bookId).ReturnsNull();

        var result = await _svc.AddBookToCollectionAsync(UserId, collectionId, bookId, "Note");

        Assert.Equal(bookId, result.BookId);
        await _collectionRepo.Received(1).AddBookAsync(Arg.Any<CollectionBook>());
    }

    [Fact]
    public async Task AddBookToCollectionAsync_ThrowsArgException_WhenAlreadyInCollection()
    {
        var collectionId = Guid.NewGuid();
        var bookId = Guid.NewGuid();
        var collection = new Collection { Id = collectionId, UserId = UserId, Name = "Test", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        var existingEntry = new CollectionBook { Id = Guid.NewGuid(), CollectionId = collectionId, BookId = bookId, AddedAt = DateTime.UtcNow };
        _collectionRepo.GetByIdAsync(collectionId).Returns(collection);
        _collectionRepo.GetCollectionBookAsync(collectionId, bookId).Returns(existingEntry);

        await Assert.ThrowsAsync<ArgumentException>(
            () => _svc.AddBookToCollectionAsync(UserId, collectionId, bookId, null));
    }
}
