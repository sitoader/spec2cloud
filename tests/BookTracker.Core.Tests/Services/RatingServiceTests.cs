using BookTracker.Core.Entities;
using BookTracker.Core.Exceptions;
using BookTracker.Core.Repositories;
using BookTracker.Core.Services;
using Microsoft.Extensions.Logging;
using NSubstitute;
using NSubstitute.ReturnsExtensions;

namespace BookTracker.Core.Tests.Services;

/// <summary>
/// Unit tests for <see cref="RatingService"/> covering ownership validation,
/// CRUD operations, score validation, and upsert behavior.
/// </summary>
public class RatingServiceTests
{
    private readonly IBookRepository _bookRepo;
    private readonly IRatingRepository _ratingRepo;
    private readonly RatingService _svc;
    private const string UserId = "user-1";
    private const string OtherUserId = "user-2";

    public RatingServiceTests()
    {
        _bookRepo = Substitute.For<IBookRepository>();
        _ratingRepo = Substitute.For<IRatingRepository>();
        var logger = Substitute.For<ILogger<RatingService>>();
        _svc = new RatingService(_bookRepo, _ratingRepo, logger);
    }

    // ── AddOrUpdateRatingAsync ──────────────────────────────────

    [Fact]
    public async Task AddOrUpdateRatingAsync_CreatesNewRating_WhenNoneExists()
    {
        var bookId = Guid.NewGuid();
        var book = MakeBook("Book", UserId, bookId);
        _bookRepo.GetByIdAsync(bookId).Returns(book);
        _ratingRepo.GetByBookIdAsync(bookId).ReturnsNull();

        var result = await _svc.AddOrUpdateRatingAsync(UserId, bookId, 4, "Great book!");

        Assert.Equal(4, result.Score);
        Assert.Equal("Great book!", result.Notes);
        Assert.NotEqual(Guid.Empty, result.Id);
        await _ratingRepo.Received(1).AddAsync(Arg.Any<Rating>());
    }

    [Fact]
    public async Task AddOrUpdateRatingAsync_UpdatesExistingRating()
    {
        var bookId = Guid.NewGuid();
        var book = MakeBook("Book", UserId, bookId);
        var existing = new Rating
        {
            Id = Guid.NewGuid(),
            BookId = bookId,
            Score = 3,
            Notes = "OK",
            RatedDate = DateTime.UtcNow.AddDays(-1),
        };
        _bookRepo.GetByIdAsync(bookId).Returns(book);
        _ratingRepo.GetByBookIdAsync(bookId).Returns(existing);

        var result = await _svc.AddOrUpdateRatingAsync(UserId, bookId, 5, "Updated!");

        Assert.Equal(5, result.Score);
        Assert.Equal("Updated!", result.Notes);
        Assert.NotNull(result.UpdatedDate);
        await _ratingRepo.Received(1).UpdateAsync(Arg.Any<Rating>());
    }

    [Fact]
    public async Task AddOrUpdateRatingAsync_ThrowsBookNotFound_WhenBookDoesNotExist()
    {
        _bookRepo.GetByIdAsync(Arg.Any<Guid>()).ReturnsNull();

        await Assert.ThrowsAsync<BookNotFoundException>(
            () => _svc.AddOrUpdateRatingAsync(UserId, Guid.NewGuid(), 4, null));
    }

    [Fact]
    public async Task AddOrUpdateRatingAsync_ThrowsAccessDenied_WhenNotOwner()
    {
        var bookId = Guid.NewGuid();
        _bookRepo.GetByIdAsync(bookId).Returns(MakeBook("Book", OtherUserId, bookId));

        await Assert.ThrowsAsync<BookAccessDeniedException>(
            () => _svc.AddOrUpdateRatingAsync(UserId, bookId, 4, null));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(6)]
    [InlineData(10)]
    public async Task AddOrUpdateRatingAsync_ThrowsArgumentException_WhenScoreOutOfRange(int score)
    {
        await Assert.ThrowsAsync<ArgumentException>(
            () => _svc.AddOrUpdateRatingAsync(UserId, Guid.NewGuid(), score, null));
    }

    [Fact]
    public async Task AddOrUpdateRatingAsync_TruncatesNotes_WhenExceeds1000Chars()
    {
        var bookId = Guid.NewGuid();
        var book = MakeBook("Book", UserId, bookId);
        _bookRepo.GetByIdAsync(bookId).Returns(book);
        _ratingRepo.GetByBookIdAsync(bookId).ReturnsNull();

        var longNotes = new string('x', 1500);

        Rating? captured = null;
        _ratingRepo.AddAsync(Arg.Do<Rating>(r => captured = r))
            .Returns(Task.CompletedTask);

        await _svc.AddOrUpdateRatingAsync(UserId, bookId, 3, longNotes);

        Assert.NotNull(captured);
        Assert.Equal(1000, captured!.Notes!.Length);
    }

    [Fact]
    public async Task AddOrUpdateRatingAsync_SetsRatedDateToUtcNow()
    {
        var bookId = Guid.NewGuid();
        _bookRepo.GetByIdAsync(bookId).Returns(MakeBook("Book", UserId, bookId));
        _ratingRepo.GetByBookIdAsync(bookId).ReturnsNull();

        var before = DateTime.UtcNow;
        Rating? captured = null;
        _ratingRepo.AddAsync(Arg.Do<Rating>(r => captured = r))
            .Returns(Task.CompletedTask);

        await _svc.AddOrUpdateRatingAsync(UserId, bookId, 4, null);
        var after = DateTime.UtcNow;

        Assert.NotNull(captured);
        Assert.InRange(captured!.RatedDate, before, after);
    }

    // ── DeleteRatingAsync ───────────────────────────────────────

    [Fact]
    public async Task DeleteRatingAsync_DeletesRating_WhenExists()
    {
        var bookId = Guid.NewGuid();
        var ratingId = Guid.NewGuid();
        _bookRepo.GetByIdAsync(bookId).Returns(MakeBook("Book", UserId, bookId));
        _ratingRepo.GetByBookIdAsync(bookId).Returns(new Rating
        {
            Id = ratingId,
            BookId = bookId,
            Score = 4,
            RatedDate = DateTime.UtcNow,
        });

        await _svc.DeleteRatingAsync(UserId, bookId);

        await _ratingRepo.Received(1).DeleteAsync(ratingId);
    }

    [Fact]
    public async Task DeleteRatingAsync_ThrowsRatingNotFound_WhenNoRating()
    {
        var bookId = Guid.NewGuid();
        _bookRepo.GetByIdAsync(bookId).Returns(MakeBook("Book", UserId, bookId));
        _ratingRepo.GetByBookIdAsync(bookId).ReturnsNull();

        await Assert.ThrowsAsync<RatingNotFoundException>(
            () => _svc.DeleteRatingAsync(UserId, bookId));
    }

    [Fact]
    public async Task DeleteRatingAsync_ThrowsBookNotFound_WhenBookDoesNotExist()
    {
        _bookRepo.GetByIdAsync(Arg.Any<Guid>()).ReturnsNull();

        await Assert.ThrowsAsync<BookNotFoundException>(
            () => _svc.DeleteRatingAsync(UserId, Guid.NewGuid()));
    }

    [Fact]
    public async Task DeleteRatingAsync_ThrowsAccessDenied_WhenNotOwner()
    {
        var bookId = Guid.NewGuid();
        _bookRepo.GetByIdAsync(bookId).Returns(MakeBook("Book", OtherUserId, bookId));

        await Assert.ThrowsAsync<BookAccessDeniedException>(
            () => _svc.DeleteRatingAsync(UserId, bookId));
    }

    // ── GetBookRatingAsync ──────────────────────────────────────

    [Fact]
    public async Task GetBookRatingAsync_ReturnsRating_WhenExists()
    {
        var bookId = Guid.NewGuid();
        var expected = new Rating
        {
            Id = Guid.NewGuid(),
            BookId = bookId,
            Score = 5,
            RatedDate = DateTime.UtcNow,
        };
        _bookRepo.GetByIdAsync(bookId).Returns(MakeBook("Book", UserId, bookId));
        _ratingRepo.GetByBookIdAsync(bookId).Returns(expected);

        var result = await _svc.GetBookRatingAsync(UserId, bookId);

        Assert.NotNull(result);
        Assert.Equal(5, result!.Score);
    }

    [Fact]
    public async Task GetBookRatingAsync_ReturnsNull_WhenNoRating()
    {
        var bookId = Guid.NewGuid();
        _bookRepo.GetByIdAsync(bookId).Returns(MakeBook("Book", UserId, bookId));
        _ratingRepo.GetByBookIdAsync(bookId).ReturnsNull();

        var result = await _svc.GetBookRatingAsync(UserId, bookId);

        Assert.Null(result);
    }

    // ── Helper ──────────────────────────────────────────────────

    private static Book MakeBook(string title, string userId, Guid? id = null)
    {
        return new Book
        {
            Id = id ?? Guid.NewGuid(),
            UserId = userId,
            Title = title,
            Author = "Test Author",
            Status = BookStatus.ToRead,
            AddedDate = DateTime.UtcNow,
        };
    }
}
