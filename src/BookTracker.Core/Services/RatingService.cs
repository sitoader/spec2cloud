using BookTracker.Core.Entities;
using BookTracker.Core.Exceptions;
using BookTracker.Core.Repositories;
using Microsoft.Extensions.Logging;

namespace BookTracker.Core.Services;

/// <summary>
/// Orchestrates book rating operations with ownership validation.
/// </summary>
public class RatingService : IRatingService
{
    private readonly IBookRepository _bookRepo;
    private readonly IRatingRepository _ratingRepo;
    private readonly ILogger<RatingService> _logger;

    public RatingService(IBookRepository bookRepo, IRatingRepository ratingRepo, ILogger<RatingService> logger)
    {
        _bookRepo = bookRepo;
        _ratingRepo = ratingRepo;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<Rating> AddOrUpdateRatingAsync(string userId, Guid bookId, int score, string? notes)
    {
        // Validate score range
        if (score < 1 || score > 5)
            throw new ArgumentException("Score must be between 1 and 5.");

        // Truncate notes if exceeds 1000 characters
        if (notes is not null && notes.Length > 1000)
            notes = notes[..1000];

        // Validate book exists
        var book = await _bookRepo.GetByIdAsync(bookId);
        if (book is null)
            throw new BookNotFoundException();

        // Validate ownership
        if (book.UserId != userId)
            throw new BookAccessDeniedException();

        // Check for existing rating
        var existing = await _ratingRepo.GetByBookIdAsync(bookId);
        if (existing is not null)
        {
            existing.Score = score;
            existing.Notes = notes;
            existing.UpdatedDate = DateTime.UtcNow;
            await _ratingRepo.UpdateAsync(existing);
            _logger.LogInformation("Rating updated for book {BookId} by user {UserId}", bookId, userId);
            return existing;
        }

        var rating = new Rating
        {
            Id = Guid.NewGuid(),
            BookId = bookId,
            Score = score,
            Notes = notes,
            RatedDate = DateTime.UtcNow,
        };

        await _ratingRepo.AddAsync(rating);
        _logger.LogInformation("Rating created for book {BookId} by user {UserId}", bookId, userId);
        return rating;
    }

    /// <inheritdoc />
    public async Task DeleteRatingAsync(string userId, Guid bookId)
    {
        // Validate book exists
        var book = await _bookRepo.GetByIdAsync(bookId);
        if (book is null)
            throw new BookNotFoundException();

        // Validate ownership
        if (book.UserId != userId)
            throw new BookAccessDeniedException();

        var rating = await _ratingRepo.GetByBookIdAsync(bookId);
        if (rating is null)
            throw new RatingNotFoundException();

        await _ratingRepo.DeleteAsync(rating.Id);
        _logger.LogInformation("Rating deleted for book {BookId} by user {UserId}", bookId, userId);
    }

    /// <inheritdoc />
    public async Task<Rating?> GetBookRatingAsync(string userId, Guid bookId)
    {
        // Validate book exists
        var book = await _bookRepo.GetByIdAsync(bookId);
        if (book is null)
            throw new BookNotFoundException();

        // Validate ownership
        if (book.UserId != userId)
            throw new BookAccessDeniedException();

        return await _ratingRepo.GetByBookIdAsync(bookId);
    }
}
