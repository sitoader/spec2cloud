using BookTracker.Core.Entities;
using BookTracker.Core.Repositories;
using BookTracker.Core.Services;
using Microsoft.Extensions.Logging;
using NSubstitute;
using NSubstitute.ExceptionExtensions;
using NSubstitute.ReturnsExtensions;

namespace BookTracker.Core.Tests.Services;

/// <summary>
/// Unit tests for <see cref="BookReviewService"/> covering compose, revise, remove,
/// listing operations, ownership validation, and rating sync behavior.
/// </summary>
public class BookReviewServiceTests
{
    private readonly IBookReviewRepository _reviewRepo;
    private readonly IBookRepository _bookRepo;
    private readonly IRatingService _ratingService;
    private readonly BookReviewService _svc;
    private const string UserId = "user-1";
    private const string OtherUserId = "user-2";

    public BookReviewServiceTests()
    {
        _reviewRepo = Substitute.For<IBookReviewRepository>();
        _bookRepo = Substitute.For<IBookRepository>();
        _ratingService = Substitute.For<IRatingService>();
        var logger = Substitute.For<ILogger<BookReviewService>>();
        _svc = new BookReviewService(_reviewRepo, _bookRepo, _ratingService, logger);
    }

    // ── ComposeReviewAsync ──────────────────────────────────────

    [Fact]
    public async Task ComposeReviewAsync_CreatesReview_WhenValid()
    {
        var bookId = Guid.NewGuid();
        _reviewRepo.FindByReviewerAndBookAsync(UserId, bookId).ReturnsNull();
        _ratingService.AddOrUpdateRatingAsync(UserId, bookId, 4, "Loved it!")
            .Returns(new Rating { Id = Guid.NewGuid(), BookId = bookId, Score = 4 });

        var result = await _svc.ComposeReviewAsync(
            UserId, bookId, 4, "Loved it!", "<p>Loved it!</p>", true, new[] { "sci-fi" }, "excited", true);

        Assert.Equal(UserId, result.UserId);
        Assert.Equal(bookId, result.BookId);
        Assert.Equal(4, result.Stars);
        Assert.Equal("Loved it!", result.PlainTextBody);
        Assert.True(result.IsVisible);
        Assert.NotEqual(Guid.Empty, result.Id);
        await _reviewRepo.Received(1).PersistAsync(Arg.Any<BookReview>());
    }

    [Fact]
    public async Task ComposeReviewAsync_SyncsRatingToBookRatingEntity()
    {
        var bookId = Guid.NewGuid();
        _reviewRepo.FindByReviewerAndBookAsync(UserId, bookId).ReturnsNull();
        _ratingService.AddOrUpdateRatingAsync(UserId, bookId, 5, "Amazing")
            .Returns(new Rating { Id = Guid.NewGuid(), BookId = bookId, Score = 5 });

        await _svc.ComposeReviewAsync(
            UserId, bookId, 5, "Amazing", null, true, null, null, null);

        await _ratingService.Received(1).AddOrUpdateRatingAsync(UserId, bookId, 5, "Amazing");
    }

    [Fact]
    public async Task ComposeReviewAsync_DoesNotThrow_WhenRatingSyncFails()
    {
        var bookId = Guid.NewGuid();
        _reviewRepo.FindByReviewerAndBookAsync(UserId, bookId).ReturnsNull();
        _ratingService.AddOrUpdateRatingAsync(UserId, bookId, 3, null)
            .ThrowsAsync(new InvalidOperationException("DB error"));

        var result = await _svc.ComposeReviewAsync(
            UserId, bookId, 3, null, null, true, null, null, null);

        // Review should still be created even if rating sync fails
        Assert.Equal(3, result.Stars);
        await _reviewRepo.Received(1).PersistAsync(Arg.Any<BookReview>());
    }

    [Fact]
    public async Task ComposeReviewAsync_ThrowsArgumentException_WhenDuplicateReview()
    {
        var bookId = Guid.NewGuid();
        _reviewRepo.FindByReviewerAndBookAsync(UserId, bookId)
            .Returns(new BookReview { UserId = UserId, BookId = bookId });

        await Assert.ThrowsAsync<ArgumentException>(
            () => _svc.ComposeReviewAsync(UserId, bookId, 4, "text", null, true, null, null, null));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(6)]
    [InlineData(10)]
    public async Task ComposeReviewAsync_ThrowsArgumentException_WhenStarsOutOfRange(int stars)
    {
        await Assert.ThrowsAsync<ArgumentException>(
            () => _svc.ComposeReviewAsync(UserId, Guid.NewGuid(), stars, null, null, true, null, null, null));
    }

    // ── ReviseReviewAsync ───────────────────────────────────────

    [Fact]
    public async Task ReviseReviewAsync_UpdatesReview_WhenOwnerAndValid()
    {
        var reviewId = Guid.NewGuid();
        var bookId = Guid.NewGuid();
        var existing = new BookReview
        {
            Id = reviewId,
            UserId = UserId,
            BookId = bookId,
            Stars = 3,
            PlainTextBody = "Old text",
            IsVisible = true,
            WrittenAt = DateTime.UtcNow.AddDays(-1),
            ModifiedAt = DateTime.UtcNow.AddDays(-1)
        };
        _reviewRepo.FindByIdAsync(reviewId).Returns(existing);
        _ratingService.AddOrUpdateRatingAsync(UserId, bookId, 5, "Updated text")
            .Returns(new Rating { Id = Guid.NewGuid(), BookId = bookId, Score = 5 });

        var result = await _svc.ReviseReviewAsync(
            UserId, reviewId, 5, "Updated text", "<p>Updated</p>", true, null, "reflective", false);

        Assert.Equal(5, result.Stars);
        Assert.Equal("Updated text", result.PlainTextBody);
        Assert.Equal("reflective", result.ReadingMood);
        await _reviewRepo.Received(1).ModifyAsync(existing);
    }

    [Fact]
    public async Task ReviseReviewAsync_SyncsRatingToBookRatingEntity()
    {
        var reviewId = Guid.NewGuid();
        var bookId = Guid.NewGuid();
        var existing = new BookReview
        {
            Id = reviewId,
            UserId = UserId,
            BookId = bookId,
            Stars = 3,
            IsVisible = true,
            WrittenAt = DateTime.UtcNow,
            ModifiedAt = DateTime.UtcNow
        };
        _reviewRepo.FindByIdAsync(reviewId).Returns(existing);
        _ratingService.AddOrUpdateRatingAsync(UserId, bookId, 4, "Better now")
            .Returns(new Rating { Id = Guid.NewGuid(), BookId = bookId, Score = 4 });

        await _svc.ReviseReviewAsync(
            UserId, reviewId, 4, "Better now", null, true, null, null, null);

        await _ratingService.Received(1).AddOrUpdateRatingAsync(UserId, bookId, 4, "Better now");
    }

    [Fact]
    public async Task ReviseReviewAsync_DoesNotThrow_WhenRatingSyncFails()
    {
        var reviewId = Guid.NewGuid();
        var bookId = Guid.NewGuid();
        var existing = new BookReview
        {
            Id = reviewId,
            UserId = UserId,
            BookId = bookId,
            Stars = 3,
            IsVisible = true,
            WrittenAt = DateTime.UtcNow,
            ModifiedAt = DateTime.UtcNow
        };
        _reviewRepo.FindByIdAsync(reviewId).Returns(existing);
        _ratingService.AddOrUpdateRatingAsync(UserId, bookId, 4, null)
            .ThrowsAsync(new InvalidOperationException("DB error"));

        var result = await _svc.ReviseReviewAsync(
            UserId, reviewId, 4, null, null, true, null, null, null);

        // Review should still be updated even if rating sync fails
        Assert.Equal(4, result.Stars);
        await _reviewRepo.Received(1).ModifyAsync(existing);
    }

    [Fact]
    public async Task ReviseReviewAsync_ThrowsKeyNotFoundException_WhenReviewNotFound()
    {
        _reviewRepo.FindByIdAsync(Arg.Any<Guid>()).ReturnsNull();

        await Assert.ThrowsAsync<KeyNotFoundException>(
            () => _svc.ReviseReviewAsync(UserId, Guid.NewGuid(), 4, null, null, true, null, null, null));
    }

    [Fact]
    public async Task ReviseReviewAsync_ThrowsUnauthorized_WhenNotOwner()
    {
        var reviewId = Guid.NewGuid();
        _reviewRepo.FindByIdAsync(reviewId).Returns(new BookReview
        {
            Id = reviewId,
            UserId = OtherUserId,
            BookId = Guid.NewGuid(),
            Stars = 3,
            IsVisible = true,
            WrittenAt = DateTime.UtcNow,
            ModifiedAt = DateTime.UtcNow
        });

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _svc.ReviseReviewAsync(UserId, reviewId, 4, null, null, true, null, null, null));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(6)]
    public async Task ReviseReviewAsync_ThrowsArgumentException_WhenStarsOutOfRange(int stars)
    {
        await Assert.ThrowsAsync<ArgumentException>(
            () => _svc.ReviseReviewAsync(UserId, Guid.NewGuid(), stars, null, null, true, null, null, null));
    }

    // ── RemoveReviewAsync ───────────────────────────────────────

    [Fact]
    public async Task RemoveReviewAsync_RemovesReview_WhenOwner()
    {
        var reviewId = Guid.NewGuid();
        _reviewRepo.FindByIdAsync(reviewId).Returns(new BookReview
        {
            Id = reviewId,
            UserId = UserId,
            BookId = Guid.NewGuid(),
            Stars = 4,
            IsVisible = true,
            WrittenAt = DateTime.UtcNow,
            ModifiedAt = DateTime.UtcNow
        });

        await _svc.RemoveReviewAsync(UserId, reviewId);

        await _reviewRepo.Received(1).RemoveAsync(reviewId);
    }

    [Fact]
    public async Task RemoveReviewAsync_ThrowsKeyNotFoundException_WhenReviewNotFound()
    {
        _reviewRepo.FindByIdAsync(Arg.Any<Guid>()).ReturnsNull();

        await Assert.ThrowsAsync<KeyNotFoundException>(
            () => _svc.RemoveReviewAsync(UserId, Guid.NewGuid()));
    }

    [Fact]
    public async Task RemoveReviewAsync_ThrowsUnauthorized_WhenNotOwner()
    {
        var reviewId = Guid.NewGuid();
        _reviewRepo.FindByIdAsync(reviewId).Returns(new BookReview
        {
            Id = reviewId,
            UserId = OtherUserId,
            BookId = Guid.NewGuid(),
            Stars = 3,
            IsVisible = true,
            WrittenAt = DateTime.UtcNow,
            ModifiedAt = DateTime.UtcNow
        });

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _svc.RemoveReviewAsync(UserId, reviewId));
    }

    // ── ListBookReviewsAsync ────────────────────────────────────

    [Fact]
    public async Task ListBookReviewsAsync_DelegatesToRepository()
    {
        var bookId = Guid.NewGuid();
        var reviews = new List<BookReview>
        {
            new() { Id = Guid.NewGuid(), UserId = UserId, BookId = bookId, Stars = 4, WrittenAt = DateTime.UtcNow, ModifiedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), UserId = OtherUserId, BookId = bookId, Stars = 5, WrittenAt = DateTime.UtcNow, ModifiedAt = DateTime.UtcNow }
        };
        _reviewRepo.FetchByBookAsync(bookId).Returns(reviews);

        var result = await _svc.ListBookReviewsAsync(bookId);

        Assert.Equal(2, result.Count());
        await _reviewRepo.Received(1).FetchByBookAsync(bookId);
    }

    // ── ListReviewerReviewsAsync ────────────────────────────────

    [Fact]
    public async Task ListReviewerReviewsAsync_DelegatesToRepository()
    {
        var reviews = new List<BookReview>
        {
            new() { Id = Guid.NewGuid(), UserId = UserId, BookId = Guid.NewGuid(), Stars = 3, WrittenAt = DateTime.UtcNow, ModifiedAt = DateTime.UtcNow }
        };
        _reviewRepo.FetchByReviewerAsync(UserId).Returns(reviews);

        var result = await _svc.ListReviewerReviewsAsync(UserId);

        Assert.Single(result);
        await _reviewRepo.Received(1).FetchByReviewerAsync(UserId);
    }
}
