using System.Text.Json;
using BookTracker.Core.Entities;
using BookTracker.Core.Repositories;
using Microsoft.Extensions.Logging;

namespace BookTracker.Core.Services;

/// <summary>
/// Orchestrates book review management operations with ownership validation.
/// </summary>
public class BookReviewService : IBookReviewService
{
    private readonly IBookReviewRepository _reviewRepo;
    private readonly IBookRepository _bookRepo;
    private readonly IRatingService _ratingService;
    private readonly ILogger<BookReviewService> _logger;

    public BookReviewService(IBookReviewRepository reviewRepo, IBookRepository bookRepo, IRatingService ratingService, ILogger<BookReviewService> logger)
    {
        _reviewRepo = reviewRepo;
        _bookRepo = bookRepo;
        _ratingService = ratingService;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<BookReview> ComposeReviewAsync(
        string reviewerId, Guid bookId, int stars, string? plainText, string? formattedHtml,
        bool isVisible, string[]? tags, string? readingMood, bool? recommended)
    {
        if (stars < 1 || stars > 5)
            throw new ArgumentException("Stars must be between 1 and 5.");

        var existing = await _reviewRepo.FindByReviewerAndBookAsync(reviewerId, bookId);
        if (existing is not null)
            throw new ArgumentException("A review already exists for this book by this reviewer.");

        var review = new BookReview
        {
            Id = Guid.NewGuid(),
            UserId = reviewerId,
            BookId = bookId,
            Stars = stars,
            PlainTextBody = plainText,
            FormattedBody = formattedHtml,
            IsVisible = isVisible,
            TagsJson = tags is not null ? JsonSerializer.Serialize(tags) : null,
            ReadingMood = readingMood,
            Recommended = recommended,
            WrittenAt = DateTime.UtcNow,
            ModifiedAt = DateTime.UtcNow
        };

        await _reviewRepo.PersistAsync(review);

        // Sync review rating to the book's Rating entity so the rating summary stays accurate
        try
        {
            await _ratingService.AddOrUpdateRatingAsync(reviewerId, bookId, stars, plainText);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to sync review rating to book Rating entity for book {BookId}", bookId);
        }

        _logger.LogInformation("Review composed for book {BookId} by reviewer {ReviewerId}", bookId, reviewerId);
        return review;
    }

    /// <inheritdoc />
    public async Task<IEnumerable<BookReview>> ListBookReviewsAsync(Guid bookId)
    {
        return await _reviewRepo.FetchByBookAsync(bookId);
    }

    /// <inheritdoc />
    public async Task<IEnumerable<BookReview>> ListReviewerReviewsAsync(string reviewerId)
    {
        return await _reviewRepo.FetchByReviewerAsync(reviewerId);
    }

    /// <inheritdoc />
    public async Task<BookReview> ReviseReviewAsync(
        string reviewerId, Guid reviewId, int stars, string? plainText, string? formattedHtml,
        bool isVisible, string[]? tags, string? readingMood, bool? recommended)
    {
        if (stars < 1 || stars > 5)
            throw new ArgumentException("Stars must be between 1 and 5.");

        var existing = await _reviewRepo.FindByIdAsync(reviewId);
        if (existing is null)
            throw new KeyNotFoundException($"Review {reviewId} not found.");

        if (existing.UserId != reviewerId)
            throw new UnauthorizedAccessException("You do not own this review.");

        existing.Stars = stars;
        existing.PlainTextBody = plainText;
        existing.FormattedBody = formattedHtml;
        existing.IsVisible = isVisible;
        existing.TagsJson = tags is not null ? JsonSerializer.Serialize(tags) : null;
        existing.ReadingMood = readingMood;
        existing.Recommended = recommended;
        existing.ModifiedAt = DateTime.UtcNow;
        await _reviewRepo.ModifyAsync(existing);

        // Sync updated review rating to the book's Rating entity
        try
        {
            await _ratingService.AddOrUpdateRatingAsync(reviewerId, existing.BookId, stars, plainText);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to sync review rating to book Rating entity for review {ReviewId}", reviewId);
        }

        _logger.LogInformation("Review revised {ReviewId} by reviewer {ReviewerId}", reviewId, reviewerId);
        return existing;
    }

    /// <inheritdoc />
    public async Task RemoveReviewAsync(string reviewerId, Guid reviewId)
    {
        var existing = await _reviewRepo.FindByIdAsync(reviewId);
        if (existing is null)
            throw new KeyNotFoundException($"Review {reviewId} not found.");

        if (existing.UserId != reviewerId)
            throw new UnauthorizedAccessException("You do not own this review.");

        await _reviewRepo.RemoveAsync(reviewId);
        _logger.LogInformation("Review removed {ReviewId} by reviewer {ReviewerId}", reviewId, reviewerId);
    }
}
