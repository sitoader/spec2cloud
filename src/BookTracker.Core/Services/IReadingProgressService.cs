using BookTracker.Core.Entities;

namespace BookTracker.Core.Services;

/// <summary>
/// Contract for reading progress management operations.
/// </summary>
public interface IReadingProgressService
{
    /// <summary>Logs a new reading session.</summary>
    Task<ReadingSession> LogSessionAsync(string userId, Guid bookId, DateTime startTime, DateTime? endTime, int? pagesRead, int? currentPage, string? notes);

    /// <summary>Gets reading sessions for a book.</summary>
    Task<IEnumerable<ReadingSession>> GetSessionsAsync(string userId, Guid? bookId, DateTime? startDate, DateTime? endDate);

    /// <summary>Gets reading progress for a book.</summary>
    Task<ReadingProgress?> GetProgressAsync(string userId, Guid bookId);

    /// <summary>Updates reading progress for a book.</summary>
    Task<ReadingProgress> UpdateProgressAsync(string userId, Guid bookId, int currentPage, int? totalPages);

    /// <summary>Gets the reading streak for a user.</summary>
    Task<ReadingStreak> GetStreakAsync(string userId);
}
