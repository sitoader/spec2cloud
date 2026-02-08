using BookTracker.Core.Entities;

namespace BookTracker.Core.Repositories;

/// <summary>
/// Contract for reading streak data access operations.
/// </summary>
public interface IReadingStreakRepository
{
    /// <summary>Gets the streak record for a given owner.</summary>
    Task<ReadingStreak?> FindByOwnerAsync(string ownerId);

    /// <summary>Persists a new reading streak record.</summary>
    Task PersistAsync(ReadingStreak entity);

    /// <summary>Updates an existing reading streak record.</summary>
    Task ModifyAsync(ReadingStreak entity);
}
