using BookTracker.Core.Entities;

namespace BookTracker.Core.Repositories;

/// <summary>
/// Contract for book review data access operations.
/// </summary>
public interface IBookReviewRepository
{
    /// <summary>Gets reviews for a specific book.</summary>
    Task<IEnumerable<BookReview>> GetByBookIdAsync(Guid bookId);

    /// <summary>Gets reviews by a specific user.</summary>
    Task<IEnumerable<BookReview>> GetByUserIdAsync(string userId);

    /// <summary>Gets a review by id.</summary>
    Task<BookReview?> GetByIdAsync(Guid reviewId);

    /// <summary>Gets a review for a specific book by a user.</summary>
    Task<BookReview?> GetByUserAndBookAsync(string userId, Guid bookId);

    /// <summary>Adds a new review.</summary>
    Task AddAsync(BookReview review);

    /// <summary>Updates an existing review.</summary>
    Task UpdateAsync(BookReview review);

    /// <summary>Deletes a review.</summary>
    Task DeleteAsync(Guid reviewId);
}
