using BookTracker.Core.Entities;

namespace BookTracker.Core.Repositories;

/// <summary>
/// Contract for reading goal data access operations.
/// </summary>
public interface IReadingGoalRepository
{
    /// <summary>Gets a reading goal for a user and year.</summary>
    Task<ReadingGoal?> GetByUserAndYearAsync(string userId, int year);

    /// <summary>Adds a new reading goal.</summary>
    Task AddAsync(ReadingGoal goal);

    /// <summary>Updates an existing reading goal.</summary>
    Task UpdateAsync(ReadingGoal goal);
}
