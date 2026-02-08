using BookTracker.Core.Entities;

namespace BookTracker.Core.Repositories;

/// <summary>
/// Contract for reading session data access operations.
/// </summary>
public interface IReadingSessionRepository
{
    /// <summary>Gets reading sessions for a book by user.</summary>
    Task<IEnumerable<ReadingSession>> GetByBookIdAsync(string userId, Guid bookId);

    /// <summary>Gets reading sessions within a date range.</summary>
    Task<IEnumerable<ReadingSession>> GetByDateRangeAsync(string userId, DateTime? startDate, DateTime? endDate);

    /// <summary>Gets a session by id.</summary>
    Task<ReadingSession?> GetByIdAsync(Guid sessionId);

    /// <summary>Adds a new reading session.</summary>
    Task AddAsync(ReadingSession session);
}
