using BookTracker.Core.Entities;

namespace BookTracker.Core.Services;

/// <summary>
/// Contract for reading progress and session tracking operations.
/// </summary>
public interface IReadingProgressService
{
    /// <summary>Records a reading session for a book.</summary>
    Task<ReadingSession> RecordSessionAsync(string ownerId, Guid bookId, DateTime sessionStart, DateTime? sessionEnd, int? pageCount, int? pageReached, string? sessionNotes);

    /// <summary>Lists reading sessions, optionally filtered by book and date range.</summary>
    Task<IEnumerable<ReadingSession>> ListSessionsAsync(string ownerId, Guid? bookId, DateTime? from, DateTime? until);

    /// <summary>Fetches the current reading progress for a specific book.</summary>
    Task<ReadingProgress?> FetchProgressAsync(string ownerId, Guid bookId);

    /// <summary>Saves or updates reading progress for a book.</summary>
    Task<ReadingProgress> SaveProgressAsync(string ownerId, Guid bookId, int pageNumber, int? bookTotalPages);

    /// <summary>Fetches the current reading streak for the owner.</summary>
    Task<ReadingStreak> FetchStreakAsync(string ownerId);
}
