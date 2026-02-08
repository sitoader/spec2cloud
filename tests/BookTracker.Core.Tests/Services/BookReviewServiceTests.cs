using BookTracker.Core.Entities;
using BookTracker.Core.Exceptions;
using BookTracker.Core.Repositories;
using BookTracker.Core.Services;
using Microsoft.Extensions.Logging;
using NSubstitute;
using NSubstitute.ReturnsExtensions;

namespace BookTracker.Core.Tests.Services;

/// <summary>
/// Unit tests for <see cref="BookReviewService"/>.
/// </summary>
public class BookReviewServiceTests
{
    private readonly IBookReviewRepository _reviewRepo;
    private readonly IBookRepository _bookRepo;
    private readonly BookReviewService _svc;
    private const string UserId = "user-1";

    public BookReviewServiceTests()
    {
        _reviewRepo = Substitute.For<IBookReviewRepository>();
        _bookRepo = Substitute.For<IBookRepository>();
        var logger = Substitute.For<ILogger<BookReviewService>>();
        _svc = new BookReviewService(_reviewRepo, _bookRepo, logger);
    }

    [Fact]
    public async Task CreateReviewAsync_CreatesReview()
    {
        var bookId = Guid.NewGuid();
        var book = new Book { Id = bookId, UserId = UserId, Title = "Test", Author = "Author", Status = BookStatus.Completed };
        _bookRepo.GetByIdAsync(bookId).Returns(book);
        _reviewRepo.GetByUserAndBookAsync(UserId, bookId).ReturnsNull();

        var result = await _svc.CreateReviewAsync(UserId, bookId, 5, "Amazing!", "<p>Amazing!</p>", true, new[] { "great" }, "happy", true);

        Assert.Equal(5, result.Rating);
        Assert.Equal("Amazing!", result.ReviewText);
        Assert.True(result.IsPublic);
        await _reviewRepo.Received(1).AddAsync(Arg.Any<BookReview>());
    }

    [Fact]
    public async Task CreateReviewAsync_ThrowsArgException_WhenRatingOutOfRange()
    {
        var bookId = Guid.NewGuid();
        var book = new Book { Id = bookId, UserId = UserId, Title = "Test", Author = "Author", Status = BookStatus.Completed };
        _bookRepo.GetByIdAsync(bookId).Returns(book);

        await Assert.ThrowsAsync<ArgumentException>(
            () => _svc.CreateReviewAsync(UserId, bookId, 6, null, null, true, null, null, null));
    }

    [Fact]
    public async Task CreateReviewAsync_ThrowsBookNotFound()
    {
        _bookRepo.GetByIdAsync(Arg.Any<Guid>()).ReturnsNull();

        await Assert.ThrowsAsync<BookNotFoundException>(
            () => _svc.CreateReviewAsync(UserId, Guid.NewGuid(), 4, null, null, true, null, null, null));
    }

    [Fact]
    public async Task CreateReviewAsync_ThrowsArgException_WhenReviewAlreadyExists()
    {
        var bookId = Guid.NewGuid();
        var book = new Book { Id = bookId, UserId = UserId, Title = "Test", Author = "Author", Status = BookStatus.Completed };
        var existing = new BookReview { Id = Guid.NewGuid(), UserId = UserId, BookId = bookId, Rating = 3, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        _bookRepo.GetByIdAsync(bookId).Returns(book);
        _reviewRepo.GetByUserAndBookAsync(UserId, bookId).Returns(existing);

        await Assert.ThrowsAsync<ArgumentException>(
            () => _svc.CreateReviewAsync(UserId, bookId, 5, null, null, true, null, null, null));
    }

    [Fact]
    public async Task UpdateReviewAsync_UpdatesReview()
    {
        var reviewId = Guid.NewGuid();
        var review = new BookReview { Id = reviewId, UserId = UserId, BookId = Guid.NewGuid(), Rating = 3, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        _reviewRepo.GetByIdAsync(reviewId).Returns(review);

        var result = await _svc.UpdateReviewAsync(UserId, reviewId, 5, null, null, null, null, null, null);

        Assert.Equal(5, result.Rating);
        await _reviewRepo.Received(1).UpdateAsync(Arg.Any<BookReview>());
    }

    [Fact]
    public async Task DeleteReviewAsync_ThrowsAccessDenied_WhenNotOwner()
    {
        var reviewId = Guid.NewGuid();
        var review = new BookReview { Id = reviewId, UserId = "other-user", BookId = Guid.NewGuid(), Rating = 3, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        _reviewRepo.GetByIdAsync(reviewId).Returns(review);

        await Assert.ThrowsAsync<BookAccessDeniedException>(
            () => _svc.DeleteReviewAsync(UserId, reviewId));
    }

    [Fact]
    public async Task DeleteReviewAsync_ThrowsReviewNotFound()
    {
        _reviewRepo.GetByIdAsync(Arg.Any<Guid>()).ReturnsNull();

        await Assert.ThrowsAsync<ReviewNotFoundException>(
            () => _svc.DeleteReviewAsync(UserId, Guid.NewGuid()));
    }
}
