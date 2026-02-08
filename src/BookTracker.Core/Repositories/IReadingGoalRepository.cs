using BookTracker.Core.Entities;

namespace BookTracker.Core.Repositories;

/// <summary>
/// Contract for reading goal data access operations.
/// </summary>
public interface IReadingGoalRepository
{
    /// <summary>Gets a goal for a given owner and target year.</summary>
    Task<ReadingGoal?> FindByOwnerAndYearAsync(string ownerId, int targetYear);

    /// <summary>Persists a new reading goal.</summary>
    Task PersistAsync(ReadingGoal entity);

    /// <summary>Updates an existing reading goal.</summary>
    Task ModifyAsync(ReadingGoal entity);
}
