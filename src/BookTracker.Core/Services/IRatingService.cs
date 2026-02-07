using BookTracker.Core.Entities;

namespace BookTracker.Core.Services;

/// <summary>
/// Contract for book rating management operations.
/// </summary>
public interface IRatingService
{
    /// <summary>Creates or updates a rating for a book.</summary>
    Task<Rating> AddOrUpdateRatingAsync(string userId, Guid bookId, int score, string? notes);

    /// <summary>Deletes a rating for a book.</summary>
    Task DeleteRatingAsync(string userId, Guid bookId);

    /// <summary>Gets the rating for a specific book.</summary>
    Task<Rating?> GetBookRatingAsync(string userId, Guid bookId);
}
