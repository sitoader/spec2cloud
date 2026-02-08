using BookTracker.Core.Entities;

namespace BookTracker.Core.Services;

/// <summary>
/// Contract for book review management operations.
/// </summary>
public interface IBookReviewService
{
    /// <summary>Composes a new book review.</summary>
    Task<BookReview> ComposeReviewAsync(string reviewerId, Guid bookId, int stars, string? plainText, string? formattedHtml, bool isVisible, string[]? tags, string? readingMood, bool? recommended);

    /// <summary>Lists all reviews for a specific book.</summary>
    Task<IEnumerable<BookReview>> ListBookReviewsAsync(Guid bookId);

    /// <summary>Lists all reviews authored by a specific reviewer.</summary>
    Task<IEnumerable<BookReview>> ListReviewerReviewsAsync(string reviewerId);

    /// <summary>Revises an existing book review.</summary>
    Task<BookReview> ReviseReviewAsync(string reviewerId, Guid reviewId, int stars, string? plainText, string? formattedHtml, bool isVisible, string[]? tags, string? readingMood, bool? recommended);

    /// <summary>Removes a book review.</summary>
    Task RemoveReviewAsync(string reviewerId, Guid reviewId);
}
