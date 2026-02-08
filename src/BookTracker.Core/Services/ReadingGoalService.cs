using BookTracker.Core.Entities;
using BookTracker.Core.Repositories;
using Microsoft.Extensions.Logging;

namespace BookTracker.Core.Services;

/// <summary>
/// Orchestrates reading goal management operations.
/// </summary>
public class ReadingGoalService : IReadingGoalService
{
    private readonly IReadingGoalRepository _goalRepo;
    private readonly ILogger<ReadingGoalService> _logger;

    public ReadingGoalService(IReadingGoalRepository goalRepo, ILogger<ReadingGoalService> logger)
    {
        _goalRepo = goalRepo;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<ReadingGoal> EstablishGoalAsync(string ownerId, int targetYear, int targetBookCount)
    {
        if (targetBookCount < 1)
            throw new ArgumentException("Target book count must be at least 1.");

        var existing = await _goalRepo.FindByOwnerAndYearAsync(ownerId, targetYear);
        if (existing is not null)
            throw new ArgumentException($"A reading goal already exists for year {targetYear}.");

        var goal = new ReadingGoal
        {
            Id = Guid.NewGuid(),
            UserId = ownerId,
            TargetYear = targetYear,
            TargetBookCount = targetBookCount,
            FinishedBookCount = 0,
            SetAt = DateTime.UtcNow,
            ModifiedAt = DateTime.UtcNow
        };

        await _goalRepo.PersistAsync(goal);
        _logger.LogInformation("Reading goal established for year {Year} by owner {OwnerId}", targetYear, ownerId);
        return goal;
    }

    /// <inheritdoc />
    public async Task<ReadingGoal?> FetchGoalAsync(string ownerId, int targetYear)
    {
        return await _goalRepo.FindByOwnerAndYearAsync(ownerId, targetYear);
    }

    /// <inheritdoc />
    public async Task<ReadingGoal> ReviseGoalAsync(string ownerId, int targetYear, int targetBookCount)
    {
        if (targetBookCount < 1)
            throw new ArgumentException("Target book count must be at least 1.");

        var existing = await _goalRepo.FindByOwnerAndYearAsync(ownerId, targetYear);
        if (existing is null)
            throw new KeyNotFoundException($"No reading goal found for year {targetYear}.");

        existing.TargetBookCount = targetBookCount;
        existing.ModifiedAt = DateTime.UtcNow;
        await _goalRepo.ModifyAsync(existing);

        _logger.LogInformation("Reading goal revised for year {Year} by owner {OwnerId}", targetYear, ownerId);
        return existing;
    }
}
