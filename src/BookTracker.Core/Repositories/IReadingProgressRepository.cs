using BookTracker.Core.Entities;

namespace BookTracker.Core.Repositories;

/// <summary>
/// Contract for reading progress data access operations.
/// </summary>
public interface IReadingProgressRepository
{
    /// <summary>Gets progress for a given owner and book.</summary>
    Task<ReadingProgress?> FindByOwnerAndBookAsync(string ownerId, Guid bookId);

    /// <summary>Persists a new reading progress record.</summary>
    Task PersistAsync(ReadingProgress entity);

    /// <summary>Updates an existing reading progress record.</summary>
    Task ModifyAsync(ReadingProgress entity);
}
