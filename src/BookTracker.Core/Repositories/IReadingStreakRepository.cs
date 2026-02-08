using BookTracker.Core.Entities;

namespace BookTracker.Core.Repositories;

/// <summary>
/// Contract for reading streak data access operations.
/// </summary>
public interface IReadingStreakRepository
{
    /// <summary>Gets the reading streak for a user.</summary>
    Task<ReadingStreak?> GetByUserIdAsync(string userId);

    /// <summary>Adds a new reading streak record.</summary>
    Task AddAsync(ReadingStreak streak);

    /// <summary>Updates an existing reading streak record.</summary>
    Task UpdateAsync(ReadingStreak streak);
}
