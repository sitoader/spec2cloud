using BookTracker.Core.Entities;

namespace BookTracker.Core.Services;

/// <summary>
/// Contract for enhanced book review management operations.
/// </summary>
public interface IBookReviewService
{
    /// <summary>Creates a new review.</summary>
    Task<BookReview> CreateReviewAsync(string userId, Guid bookId, int rating, string? reviewText, string? reviewHtml, bool isPublic, string[]? tags, string? mood, bool? wouldRecommend);

    /// <summary>Gets reviews for a book.</summary>
    Task<IEnumerable<BookReview>> GetBookReviewsAsync(Guid bookId);

    /// <summary>Gets reviews by a user.</summary>
    Task<IEnumerable<BookReview>> GetUserReviewsAsync(string userId);

    /// <summary>Updates a review.</summary>
    Task<BookReview> UpdateReviewAsync(string userId, Guid reviewId, int? rating, string? reviewText, string? reviewHtml, bool? isPublic, string[]? tags, string? mood, bool? wouldRecommend);

    /// <summary>Deletes a review.</summary>
    Task DeleteReviewAsync(string userId, Guid reviewId);
}
