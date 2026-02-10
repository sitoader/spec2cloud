using BookTracker.Core.Entities;
using BookTracker.Core.Exceptions;
using BookTracker.Core.Repositories;
using BookTracker.Core.Services;
using Microsoft.Extensions.Logging;
using NSubstitute;
using NSubstitute.ReturnsExtensions;

namespace BookTracker.Core.Tests.Services;

/// <summary>
/// Unit tests for <see cref="BookService"/> covering ownership validation,
/// duplicate detection, CRUD operations, and status updates.
/// </summary>
public class BookServiceTests
{
    private readonly IBookRepository _repo;
    private readonly BookService _svc;
    private const string UserId = "user-1";
    private const string OtherUserId = "user-2";

    public BookServiceTests()
    {
        _repo = Substitute.For<IBookRepository>();
        var searchService = Substitute.For<IBookSearchService>();
        var logger = Substitute.For<ILogger<BookService>>();
        _svc = new BookService(_repo, searchService, logger);
    }

    // ── GetUserBooksAsync ───────────────────────────────────────

    [Fact]
    public async Task GetUserBooksAsync_ReturnsOnlyUserBooks()
    {
        var books = new List<Book>
        {
            MakeBook("Book1", UserId),
            MakeBook("Book2", UserId),
        };
        _repo.GetByUserIdAsync(UserId, null, 0, 20)
            .Returns((books, 2));

        var (result, total) = await _svc.GetUserBooksAsync(UserId, null, 1, 20);

        Assert.Equal(2, result.Count);
        Assert.Equal(2, total);
    }

    [Fact]
    public async Task GetUserBooksAsync_FiltersByStatus()
    {
        var books = new List<Book> { MakeBook("ReadBook", UserId, BookStatus.Completed) };
        _repo.GetByUserIdAsync(UserId, BookStatus.Completed, 0, 20)
            .Returns((books, 1));

        var (result, total) = await _svc.GetUserBooksAsync(UserId, BookStatus.Completed, 1, 20);

        Assert.Single(result);
        Assert.Equal(BookStatus.Completed, result[0].Status);
    }

    [Fact]
    public async Task GetUserBooksAsync_CalculatesSkipCorrectly()
    {
        _repo.GetByUserIdAsync(UserId, null, 20, 10)
            .Returns((new List<Book>(), 0));

        await _svc.GetUserBooksAsync(UserId, null, 3, 10);

        await _repo.Received(1).GetByUserIdAsync(UserId, null, 20, 10);
    }

    // ── GetBookByIdAsync ────────────────────────────────────────

    [Fact]
    public async Task GetBookByIdAsync_ReturnsBook_WhenOwnedByUser()
    {
        var bookId = Guid.NewGuid();
        var book = MakeBook("MyBook", UserId, id: bookId);
        _repo.GetByIdAsync(bookId).Returns(book);

        var result = await _svc.GetBookByIdAsync(UserId, bookId);

        Assert.Equal(bookId, result.Id);
        Assert.Equal("MyBook", result.Title);
    }

    [Fact]
    public async Task GetBookByIdAsync_ThrowsBookNotFound_WhenBookDoesNotExist()
    {
        _repo.GetByIdAsync(Arg.Any<Guid>()).ReturnsNull();

        await Assert.ThrowsAsync<BookNotFoundException>(
            () => _svc.GetBookByIdAsync(UserId, Guid.NewGuid()));
    }

    [Fact]
    public async Task GetBookByIdAsync_ThrowsAccessDenied_WhenBookBelongsToDifferentUser()
    {
        var bookId = Guid.NewGuid();
        var book = MakeBook("OtherBook", OtherUserId, id: bookId);
        _repo.GetByIdAsync(bookId).Returns(book);

        await Assert.ThrowsAsync<BookAccessDeniedException>(
            () => _svc.GetBookByIdAsync(UserId, bookId));
    }

    // ── AddBookAsync ────────────────────────────────────────────

    [Fact]
    public async Task AddBookAsync_CreatesBook_WhenNoDuplicate()
    {
        _repo.ExistsAsync(UserId, "New Book").Returns(false);
        _repo.GetByIdAsync(UserId, Arg.Any<Guid>())
            .Returns(x => MakeBook("New Book", UserId, id: x.ArgAt<Guid>(1)));

        var result = await _svc.AddBookAsync(UserId, "New Book", "Author",
            null, null, null, null, null, BookStatus.ToRead, null);

        Assert.Equal("New Book", result.Title);
        await _repo.Received(1).AddAsync(Arg.Any<Book>());
    }

    [Fact]
    public async Task AddBookAsync_ThrowsDuplicate_WhenTitleExists()
    {
        _repo.ExistsAsync(UserId, "Existing Book").Returns(true);

        await Assert.ThrowsAsync<DuplicateBookException>(
            () => _svc.AddBookAsync(UserId, "Existing Book", "Author",
                null, null, null, null, null, BookStatus.ToRead, null));
    }

    [Fact]
    public async Task AddBookAsync_SetsAddedDateToUtcNow()
    {
        _repo.ExistsAsync(UserId, "Dated Book").Returns(false);

        var before = DateTime.UtcNow;
        Book? captured = null;
        _repo.AddAsync(Arg.Do<Book>(b => captured = b))
            .Returns(Task.CompletedTask);
        _repo.GetByIdAsync(UserId, Arg.Any<Guid>())
            .Returns(x => MakeBook("Dated Book", UserId, id: x.ArgAt<Guid>(1)));

        await _svc.AddBookAsync(UserId, "Dated Book", "Author",
            null, null, null, null, null, BookStatus.ToRead, null);
        var after = DateTime.UtcNow;

        Assert.NotNull(captured);
        Assert.InRange(captured!.AddedDate, before, after);
    }

    // ── UpdateBookAsync ─────────────────────────────────────────

    [Fact]
    public async Task UpdateBookAsync_UpdatesFields()
    {
        var bookId = Guid.NewGuid();
        var book = MakeBook("Old Title", UserId, id: bookId);
        _repo.GetByIdAsync(bookId).Returns(book);
        _repo.GetByIdAsync(UserId, bookId).Returns(MakeBook("New Title", UserId, id: bookId));

        var result = await _svc.UpdateBookAsync(UserId, bookId,
            "New Title", null, BookStatus.Reading,
            null, null, null, null, null, null);

        await _repo.Received(1).UpdateAsync(Arg.Any<Book>());
    }

    [Fact]
    public async Task UpdateBookAsync_ThrowsNotFound_WhenBookDoesNotExist()
    {
        _repo.GetByIdAsync(Arg.Any<Guid>()).ReturnsNull();

        await Assert.ThrowsAsync<BookNotFoundException>(
            () => _svc.UpdateBookAsync(UserId, Guid.NewGuid(),
                "Title", null, null, null, null, null, null, null, null));
    }

    [Fact]
    public async Task UpdateBookAsync_ThrowsAccessDenied_WhenNotOwner()
    {
        var bookId = Guid.NewGuid();
        _repo.GetByIdAsync(bookId).Returns(MakeBook("Book", OtherUserId, id: bookId));

        await Assert.ThrowsAsync<BookAccessDeniedException>(
            () => _svc.UpdateBookAsync(UserId, bookId,
                "Title", null, null, null, null, null, null, null, null));
    }

    // ── UpdateBookStatusAsync ───────────────────────────────────

    [Fact]
    public async Task UpdateBookStatusAsync_ChangesStatus()
    {
        var bookId = Guid.NewGuid();
        var book = MakeBook("StatusBook", UserId, BookStatus.ToRead, bookId);
        _repo.GetByIdAsync(bookId).Returns(book);
        _repo.GetByIdAsync(UserId, bookId)
            .Returns(MakeBook("StatusBook", UserId, BookStatus.Completed, bookId));

        var result = await _svc.UpdateBookStatusAsync(UserId, bookId, BookStatus.Completed);

        await _repo.Received(1).UpdateAsync(Arg.Any<Book>());
    }

    [Fact]
    public async Task UpdateBookStatusAsync_ThrowsNotFound_WhenBookDoesNotExist()
    {
        _repo.GetByIdAsync(Arg.Any<Guid>()).ReturnsNull();

        await Assert.ThrowsAsync<BookNotFoundException>(
            () => _svc.UpdateBookStatusAsync(UserId, Guid.NewGuid(), BookStatus.Reading));
    }

    // ── DeleteBookAsync ─────────────────────────────────────────

    [Fact]
    public async Task DeleteBookAsync_DeletesBook_WhenOwned()
    {
        var bookId = Guid.NewGuid();
        _repo.GetByIdAsync(bookId).Returns(MakeBook("DeleteMe", UserId, id: bookId));

        await _svc.DeleteBookAsync(UserId, bookId);

        await _repo.Received(1).DeleteAsync(bookId);
    }

    [Fact]
    public async Task DeleteBookAsync_ThrowsNotFound_WhenBookDoesNotExist()
    {
        _repo.GetByIdAsync(Arg.Any<Guid>()).ReturnsNull();

        await Assert.ThrowsAsync<BookNotFoundException>(
            () => _svc.DeleteBookAsync(UserId, Guid.NewGuid()));
    }

    [Fact]
    public async Task DeleteBookAsync_ThrowsAccessDenied_WhenNotOwner()
    {
        var bookId = Guid.NewGuid();
        _repo.GetByIdAsync(bookId).Returns(MakeBook("NotMine", OtherUserId, id: bookId));

        await Assert.ThrowsAsync<BookAccessDeniedException>(
            () => _svc.DeleteBookAsync(UserId, bookId));
    }

    // ── CheckDuplicateAsync ─────────────────────────────────────

    [Fact]
    public async Task CheckDuplicateAsync_ReturnsTrue_WhenDuplicateExists()
    {
        _repo.ExistsAsync(UserId, "DupBook").Returns(true);

        var result = await _svc.CheckDuplicateAsync(UserId, "DupBook");

        Assert.True(result);
    }

    [Fact]
    public async Task CheckDuplicateAsync_ReturnsFalse_WhenNoDuplicate()
    {
        _repo.ExistsAsync(UserId, "UniqueBook").Returns(false);

        var result = await _svc.CheckDuplicateAsync(UserId, "UniqueBook");

        Assert.False(result);
    }

    // ── Helper ──────────────────────────────────────────────────

    private static Book MakeBook(string title, string userId,
        BookStatus status = BookStatus.ToRead, Guid? id = null)
    {
        return new Book
        {
            Id = id ?? Guid.NewGuid(),
            UserId = userId,
            Title = title,
            Author = "Test Author",
            Status = status,
            AddedDate = DateTime.UtcNow,
        };
    }
}
