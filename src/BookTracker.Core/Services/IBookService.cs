using BookTracker.Core.Entities;

namespace BookTracker.Core.Services;

/// <summary>
/// Contract for book library management operations.
/// </summary>
public interface IBookService
{
    /// <summary>Retrieves paginated books for a user, optionally filtered by status.</summary>
    Task<(List<Book> Books, int TotalCount)> GetUserBooksAsync(
        string userId, BookStatus? status, int page, int pageSize);

    /// <summary>Retrieves a single book belonging to the user.</summary>
    Task<Book> GetBookByIdAsync(string userId, Guid bookId);

    /// <summary>Adds a new book to the user's library.</summary>
    Task<Book> AddBookAsync(string userId, string title, string author,
        string? isbn, string? coverImageUrl, string? description,
        string[]? genres, DateTime? publicationDate, BookStatus status, string? source);

    /// <summary>Updates an existing book's fields.</summary>
    Task<Book> UpdateBookAsync(string userId, Guid bookId,
        string? title, string? author, BookStatus? status,
        string? isbn, string? coverImageUrl, string? description,
        string[]? genres, DateTime? publicationDate, string? source);

    /// <summary>Updates only the reading status of a book.</summary>
    Task<Book> UpdateBookStatusAsync(string userId, Guid bookId, BookStatus status);

    /// <summary>Deletes a book from the user's library.</summary>
    Task DeleteBookAsync(string userId, Guid bookId);

    /// <summary>Checks if a duplicate book title exists for the user.</summary>
    Task<bool> CheckDuplicateAsync(string userId, string title);
}
