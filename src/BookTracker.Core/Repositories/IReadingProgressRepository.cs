using BookTracker.Core.Entities;

namespace BookTracker.Core.Repositories;

/// <summary>
/// Contract for reading progress data access operations.
/// </summary>
public interface IReadingProgressRepository
{
    /// <summary>Gets reading progress for a specific book and user.</summary>
    Task<ReadingProgress?> GetByUserAndBookAsync(string userId, Guid bookId);

    /// <summary>Adds a new reading progress record.</summary>
    Task AddAsync(ReadingProgress progress);

    /// <summary>Updates an existing reading progress record.</summary>
    Task UpdateAsync(ReadingProgress progress);
}
