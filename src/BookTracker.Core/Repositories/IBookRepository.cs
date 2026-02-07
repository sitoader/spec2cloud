using BookTracker.Core.Entities;

namespace BookTracker.Core.Repositories;

/// <summary>
/// Contract for book data access operations.
/// </summary>
public interface IBookRepository
{
    /// <summary>Retrieves paginated books for a user, optionally filtered by status.</summary>
    Task<(List<Book> Books, int TotalCount)> GetByUserIdAsync(
        string userId, BookStatus? status, int skip, int take);

    /// <summary>Retrieves a single book by id, ensuring it belongs to the given user.</summary>
    Task<Book?> GetByIdAsync(string userId, Guid bookId);

    /// <summary>Retrieves a book by id without user filter (for ownership checks).</summary>
    Task<Book?> GetByIdAsync(Guid bookId);

    /// <summary>Adds a new book.</summary>
    Task AddAsync(Book book);

    /// <summary>Updates an existing book.</summary>
    Task UpdateAsync(Book book);

    /// <summary>Deletes a book by id.</summary>
    Task DeleteAsync(Guid bookId);

    /// <summary>Checks if a book with the given title exists for the user (case-insensitive).</summary>
    Task<bool> ExistsAsync(string userId, string title);
}
