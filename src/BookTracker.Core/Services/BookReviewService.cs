using BookTracker.Core.Entities;
using BookTracker.Core.Exceptions;
using BookTracker.Core.Repositories;
using Microsoft.Extensions.Logging;

namespace BookTracker.Core.Services;

/// <summary>
/// Orchestrates enhanced book review operations.
/// </summary>
public class BookReviewService : IBookReviewService
{
    private readonly IBookReviewRepository _reviewRepo;
    private readonly IBookRepository _bookRepo;
    private readonly ILogger<BookReviewService> _logger;

    public BookReviewService(IBookReviewRepository reviewRepo, IBookRepository bookRepo, ILogger<BookReviewService> logger)
    {
        _reviewRepo = reviewRepo;
        _bookRepo = bookRepo;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<BookReview> CreateReviewAsync(string userId, Guid bookId, int rating, string? reviewText, string? reviewHtml, bool isPublic, string[]? tags, string? mood, bool? wouldRecommend)
    {
        if (rating < 1 || rating > 5)
            throw new ArgumentException("Rating must be between 1 and 5.");

        var book = await _bookRepo.GetByIdAsync(bookId);
        if (book is null)
            throw new BookNotFoundException();

        var existing = await _reviewRepo.GetByUserAndBookAsync(userId, bookId);
        if (existing is not null)
            throw new ArgumentException("A review already exists for this book. Use update instead.");

        var review = new BookReview
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            BookId = bookId,
            Rating = rating,
            ReviewText = reviewText,
            ReviewHtml = reviewHtml,
            IsPublic = isPublic,
            Tags = tags is not null ? System.Text.Json.JsonSerializer.Serialize(tags) : null,
            Mood = mood,
            WouldRecommend = wouldRecommend,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _reviewRepo.AddAsync(review);
        _logger.LogInformation("Review created for book {BookId} by user {UserId}", bookId, userId);
        return review;
    }

    /// <inheritdoc />
    public async Task<IEnumerable<BookReview>> GetBookReviewsAsync(Guid bookId)
    {
        return await _reviewRepo.GetByBookIdAsync(bookId);
    }

    /// <inheritdoc />
    public async Task<IEnumerable<BookReview>> GetUserReviewsAsync(string userId)
    {
        return await _reviewRepo.GetByUserIdAsync(userId);
    }

    /// <inheritdoc />
    public async Task<BookReview> UpdateReviewAsync(string userId, Guid reviewId, int? rating, string? reviewText, string? reviewHtml, bool? isPublic, string[]? tags, string? mood, bool? wouldRecommend)
    {
        var review = await _reviewRepo.GetByIdAsync(reviewId);
        if (review is null)
            throw new ReviewNotFoundException();
        if (review.UserId != userId)
            throw new BookAccessDeniedException();

        if (rating.HasValue)
        {
            if (rating.Value < 1 || rating.Value > 5)
                throw new ArgumentException("Rating must be between 1 and 5.");
            review.Rating = rating.Value;
        }
        if (reviewText is not null) review.ReviewText = reviewText;
        if (reviewHtml is not null) review.ReviewHtml = reviewHtml;
        if (isPublic.HasValue) review.IsPublic = isPublic.Value;
        if (tags is not null) review.Tags = System.Text.Json.JsonSerializer.Serialize(tags);
        if (mood is not null) review.Mood = mood;
        if (wouldRecommend.HasValue) review.WouldRecommend = wouldRecommend.Value;
        review.UpdatedAt = DateTime.UtcNow;

        await _reviewRepo.UpdateAsync(review);
        _logger.LogInformation("Review updated {ReviewId} by user {UserId}", reviewId, userId);
        return review;
    }

    /// <inheritdoc />
    public async Task DeleteReviewAsync(string userId, Guid reviewId)
    {
        var review = await _reviewRepo.GetByIdAsync(reviewId);
        if (review is null)
            throw new ReviewNotFoundException();
        if (review.UserId != userId)
            throw new BookAccessDeniedException();

        await _reviewRepo.DeleteAsync(reviewId);
        _logger.LogInformation("Review deleted {ReviewId} by user {UserId}", reviewId, userId);
    }
}
