using System.Text.Json;
using BookTracker.Core.Entities;
using BookTracker.Core.Exceptions;
using BookTracker.Core.Repositories;
using Microsoft.Extensions.Logging;

namespace BookTracker.Core.Services;

/// <summary>
/// Orchestrates book library management operations with ownership validation,
/// duplicate detection, and repository coordination.
/// </summary>
public class BookService : IBookService
{
    private readonly IBookRepository _repo;
    private readonly ILogger<BookService> _logger;

    public BookService(IBookRepository repo, ILogger<BookService> logger)
    {
        _repo = repo;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<(List<Book> Books, int TotalCount)> GetUserBooksAsync(
        string userId, BookStatus? status, int page, int pageSize)
    {
        var skip = (page - 1) * pageSize;
        return await _repo.GetByUserIdAsync(userId, status, skip, pageSize);
    }

    /// <inheritdoc />
    public async Task<Book> GetBookByIdAsync(string userId, Guid bookId)
    {
        // First check if book exists at all
        var book = await _repo.GetByIdAsync(bookId);
        if (book is null)
            throw new BookNotFoundException();

        // Then check ownership
        if (book.UserId != userId)
            throw new BookAccessDeniedException();

        return book;
    }

    /// <inheritdoc />
    public async Task<Book> AddBookAsync(string userId, string title, string author,
        string? isbn, string? coverImageUrl, string? description,
        string[]? genres, DateTime? publicationDate, BookStatus status, string? source)
    {
        // Check for duplicate title
        if (await _repo.ExistsAsync(userId, title))
        {
            _logger.LogWarning("Duplicate book title '{Title}' for user {UserId}", title, userId);
            throw new DuplicateBookException();
        }

        var book = new Book
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = title,
            Author = author,
            Isbn = isbn,
            CoverImageUrl = coverImageUrl,
            Description = description,
            Genres = genres != null ? JsonSerializer.Serialize(genres) : null,
            PublicationDate = publicationDate.HasValue 
                ? DateTime.SpecifyKind(publicationDate.Value, DateTimeKind.Utc)
                : null,
            Status = status,
            AddedDate = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc),
            Source = source,
        };

        await _repo.AddAsync(book);
        _logger.LogInformation("Book '{Title}' added for user {UserId}", title, userId);

        // Re-fetch to include navigation properties
        return (await _repo.GetByIdAsync(userId, book.Id))!;
    }

    /// <inheritdoc />
    public async Task<Book> UpdateBookAsync(string userId, Guid bookId,
        string? title, string? author, BookStatus? status,
        string? isbn, string? coverImageUrl, string? description,
        string[]? genres, DateTime? publicationDate, string? source)
    {
        // Check existence and ownership
        var book = await _repo.GetByIdAsync(bookId);
        if (book is null)
            throw new BookNotFoundException();
        if (book.UserId != userId)
            throw new BookAccessDeniedException();

        // Apply partial updates
        if (title is not null) book.Title = title;
        if (author is not null) book.Author = author;
        if (status.HasValue) book.Status = status.Value;
        if (isbn is not null) book.Isbn = isbn;
        if (coverImageUrl is not null) book.CoverImageUrl = coverImageUrl;
        if (description is not null) book.Description = description;
        if (genres is not null) book.Genres = JsonSerializer.Serialize(genres);
        if (publicationDate.HasValue) book.PublicationDate = publicationDate.Value;
        if (source is not null) book.Source = source;

        await _repo.UpdateAsync(book);
        _logger.LogInformation("Book {BookId} updated for user {UserId}", bookId, userId);

        return (await _repo.GetByIdAsync(userId, bookId))!;
    }

    /// <inheritdoc />
    public async Task<Book> UpdateBookStatusAsync(string userId, Guid bookId, BookStatus status)
    {
        var book = await _repo.GetByIdAsync(bookId);
        if (book is null)
            throw new BookNotFoundException();
        if (book.UserId != userId)
            throw new BookAccessDeniedException();

        book.Status = status;
        await _repo.UpdateAsync(book);
        _logger.LogInformation("Book {BookId} status changed to {Status} for user {UserId}",
            bookId, status, userId);

        return (await _repo.GetByIdAsync(userId, bookId))!;
    }

    /// <inheritdoc />
    public async Task DeleteBookAsync(string userId, Guid bookId)
    {
        var book = await _repo.GetByIdAsync(bookId);
        if (book is null)
            throw new BookNotFoundException();
        if (book.UserId != userId)
            throw new BookAccessDeniedException();

        await _repo.DeleteAsync(bookId);
        _logger.LogInformation("Book {BookId} deleted for user {UserId}", bookId, userId);
    }

    /// <inheritdoc />
    public async Task<bool> CheckDuplicateAsync(string userId, string title)
    {
        return await _repo.ExistsAsync(userId, title);
    }
}
