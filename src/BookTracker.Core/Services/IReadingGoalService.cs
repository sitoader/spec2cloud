using BookTracker.Core.Entities;

namespace BookTracker.Core.Services;

/// <summary>
/// Contract for reading goal management operations.
/// </summary>
public interface IReadingGoalService
{
    /// <summary>Establishes a new reading goal for a given year.</summary>
    Task<ReadingGoal> EstablishGoalAsync(string ownerId, int targetYear, int targetBookCount);

    /// <summary>Fetches the reading goal for a given year.</summary>
    Task<ReadingGoal?> FetchGoalAsync(string ownerId, int targetYear);

    /// <summary>Revises an existing reading goal for a given year.</summary>
    Task<ReadingGoal> ReviseGoalAsync(string ownerId, int targetYear, int targetBookCount);
}
