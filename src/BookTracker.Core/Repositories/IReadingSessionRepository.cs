using BookTracker.Core.Entities;

namespace BookTracker.Core.Repositories;

/// <summary>
/// Contract for reading session data access operations.
/// </summary>
public interface IReadingSessionRepository
{
    /// <summary>Gets all sessions for a given owner and book.</summary>
    Task<IEnumerable<ReadingSession>> FetchByOwnerAndBookAsync(string ownerId, Guid bookId);

    /// <summary>Gets sessions for a given owner within an optional date range.</summary>
    Task<IEnumerable<ReadingSession>> FetchByOwnerAsync(string ownerId, DateTime? from, DateTime? until);

    /// <summary>Gets a single session by its id.</summary>
    Task<ReadingSession?> FindByIdAsync(Guid sessionId);

    /// <summary>Persists a new reading session.</summary>
    Task PersistAsync(ReadingSession entity);
}
