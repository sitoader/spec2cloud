using BookTracker.Core.Entities;
using BookTracker.Core.Exceptions;
using BookTracker.Core.Repositories;
using BookTracker.Core.Services;
using Microsoft.Extensions.Logging;
using NSubstitute;
using NSubstitute.ReturnsExtensions;

namespace BookTracker.Core.Tests.Services;

/// <summary>
/// Unit tests for <see cref="ReadingProgressService"/>.
/// </summary>
public class ReadingProgressServiceTests
{
    private readonly IReadingSessionRepository _sessionRepo;
    private readonly IReadingProgressRepository _progressRepo;
    private readonly IReadingStreakRepository _streakRepo;
    private readonly IBookRepository _bookRepo;
    private readonly ReadingProgressService _svc;
    private const string UserId = "user-1";

    public ReadingProgressServiceTests()
    {
        _sessionRepo = Substitute.For<IReadingSessionRepository>();
        _progressRepo = Substitute.For<IReadingProgressRepository>();
        _streakRepo = Substitute.For<IReadingStreakRepository>();
        _bookRepo = Substitute.For<IBookRepository>();
        var logger = Substitute.For<ILogger<ReadingProgressService>>();
        _svc = new ReadingProgressService(_sessionRepo, _progressRepo, _streakRepo, _bookRepo, logger);
    }

    [Fact]
    public async Task LogSessionAsync_CreatesSession_WhenBookExists()
    {
        var bookId = Guid.NewGuid();
        var book = new Book { Id = bookId, UserId = UserId, Title = "Test", Author = "Author", Status = BookStatus.Reading };
        _bookRepo.GetByIdAsync(bookId).Returns(book);
        _streakRepo.GetByUserIdAsync(UserId).ReturnsNull();

        var result = await _svc.LogSessionAsync(UserId, bookId, DateTime.UtcNow.AddHours(-1), DateTime.UtcNow, 30, 130, "Notes");

        Assert.Equal(bookId, result.BookId);
        Assert.Equal(30, result.PagesRead);
        Assert.Equal(130, result.CurrentPage);
        await _sessionRepo.Received(1).AddAsync(Arg.Any<ReadingSession>());
    }

    [Fact]
    public async Task LogSessionAsync_ThrowsBookNotFound_WhenBookDoesNotExist()
    {
        _bookRepo.GetByIdAsync(Arg.Any<Guid>()).ReturnsNull();

        await Assert.ThrowsAsync<BookNotFoundException>(
            () => _svc.LogSessionAsync(UserId, Guid.NewGuid(), DateTime.UtcNow, null, null, null, null));
    }

    [Fact]
    public async Task LogSessionAsync_ThrowsAccessDenied_WhenNotOwner()
    {
        var bookId = Guid.NewGuid();
        var book = new Book { Id = bookId, UserId = "other-user", Title = "Test", Author = "Author", Status = BookStatus.Reading };
        _bookRepo.GetByIdAsync(bookId).Returns(book);

        await Assert.ThrowsAsync<BookAccessDeniedException>(
            () => _svc.LogSessionAsync(UserId, bookId, DateTime.UtcNow, null, null, null, null));
    }

    [Fact]
    public async Task UpdateProgressAsync_CreatesNew_WhenNoneExists()
    {
        var bookId = Guid.NewGuid();
        var book = new Book { Id = bookId, UserId = UserId, Title = "Test", Author = "Author", Status = BookStatus.Reading };
        _bookRepo.GetByIdAsync(bookId).Returns(book);
        _progressRepo.GetByUserAndBookAsync(UserId, bookId).ReturnsNull();

        var result = await _svc.UpdateProgressAsync(UserId, bookId, 100, 350);

        Assert.Equal(100, result.CurrentPage);
        Assert.Equal(350, result.TotalPages);
        Assert.Equal(28.57m, result.ProgressPercentage);
        await _progressRepo.Received(1).AddAsync(Arg.Any<ReadingProgress>());
    }

    [Fact]
    public async Task UpdateProgressAsync_UpdatesExisting()
    {
        var bookId = Guid.NewGuid();
        var book = new Book { Id = bookId, UserId = UserId, Title = "Test", Author = "Author", Status = BookStatus.Reading };
        var existing = new ReadingProgress { Id = Guid.NewGuid(), UserId = UserId, BookId = bookId, CurrentPage = 50, TotalPages = 350, LastUpdated = DateTime.UtcNow.AddDays(-1) };
        _bookRepo.GetByIdAsync(bookId).Returns(book);
        _progressRepo.GetByUserAndBookAsync(UserId, bookId).Returns(existing);

        var result = await _svc.UpdateProgressAsync(UserId, bookId, 200, null);

        Assert.Equal(200, result.CurrentPage);
        Assert.Equal(350, result.TotalPages);
        await _progressRepo.Received(1).UpdateAsync(Arg.Any<ReadingProgress>());
    }

    [Fact]
    public async Task GetStreakAsync_CreatesNew_WhenNoneExists()
    {
        _streakRepo.GetByUserIdAsync(UserId).ReturnsNull();

        var result = await _svc.GetStreakAsync(UserId);

        Assert.Equal(0, result.CurrentStreak);
        Assert.Equal(0, result.LongestStreak);
        await _streakRepo.Received(1).AddAsync(Arg.Any<ReadingStreak>());
    }

    [Fact]
    public async Task GetStreakAsync_ReturnsExisting()
    {
        var streak = new ReadingStreak { Id = Guid.NewGuid(), UserId = UserId, CurrentStreak = 5, LongestStreak = 10, LastReadDate = DateTime.UtcNow.Date, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        _streakRepo.GetByUserIdAsync(UserId).Returns(streak);

        var result = await _svc.GetStreakAsync(UserId);

        Assert.Equal(5, result.CurrentStreak);
        Assert.Equal(10, result.LongestStreak);
    }
}
