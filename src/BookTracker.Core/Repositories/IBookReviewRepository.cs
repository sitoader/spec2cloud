using BookTracker.Core.Entities;

namespace BookTracker.Core.Repositories;

/// <summary>
/// Contract for book review data access operations.
/// </summary>
public interface IBookReviewRepository
{
    /// <summary>Gets all reviews for a given book.</summary>
    Task<IEnumerable<BookReview>> FetchByBookAsync(Guid bookId);

    /// <summary>Gets all reviews written by a given reviewer.</summary>
    Task<IEnumerable<BookReview>> FetchByReviewerAsync(string reviewerId);

    /// <summary>Gets a single review by its id.</summary>
    Task<BookReview?> FindByIdAsync(Guid reviewId);

    /// <summary>Gets a review by reviewer and book.</summary>
    Task<BookReview?> FindByReviewerAndBookAsync(string reviewerId, Guid bookId);

    /// <summary>Persists a new book review.</summary>
    Task PersistAsync(BookReview entity);

    /// <summary>Updates an existing book review.</summary>
    Task ModifyAsync(BookReview entity);

    /// <summary>Removes a book review by its id.</summary>
    Task RemoveAsync(Guid reviewId);
}
