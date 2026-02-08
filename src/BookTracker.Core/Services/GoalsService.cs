using BookTracker.Core.Entities;
using BookTracker.Core.Repositories;
using Microsoft.Extensions.Logging;

namespace BookTracker.Core.Services;

/// <summary>
/// Orchestrates reading goals and achievements operations.
/// </summary>
public class GoalsService : IGoalsService
{
    private readonly IReadingGoalRepository _goalRepo;
    private readonly IAchievementRepository _achievementRepo;
    private readonly ILogger<GoalsService> _logger;

    public GoalsService(
        IReadingGoalRepository goalRepo,
        IAchievementRepository achievementRepo,
        ILogger<GoalsService> logger)
    {
        _goalRepo = goalRepo;
        _achievementRepo = achievementRepo;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<ReadingGoal> SetGoalAsync(string userId, int year, int targetBooksCount)
    {
        if (targetBooksCount < 1)
            throw new ArgumentException("Target books count must be at least 1.");

        var existing = await _goalRepo.GetByUserAndYearAsync(userId, year);
        if (existing is not null)
        {
            existing.TargetBooksCount = targetBooksCount;
            existing.UpdatedAt = DateTime.UtcNow;
            await _goalRepo.UpdateAsync(existing);
            _logger.LogInformation("Reading goal updated for user {UserId} year {Year}", userId, year);
            return existing;
        }

        var goal = new ReadingGoal
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Year = year,
            TargetBooksCount = targetBooksCount,
            CompletedBooksCount = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _goalRepo.AddAsync(goal);
        _logger.LogInformation("Reading goal created for user {UserId} year {Year}", userId, year);
        return goal;
    }

    /// <inheritdoc />
    public async Task<ReadingGoal?> GetGoalAsync(string userId, int year)
    {
        return await _goalRepo.GetByUserAndYearAsync(userId, year);
    }

    /// <inheritdoc />
    public async Task<IEnumerable<Achievement>> GetAllAchievementsAsync()
    {
        return await _achievementRepo.GetAllAsync();
    }

    /// <inheritdoc />
    public async Task<IEnumerable<UserAchievement>> GetUserAchievementsAsync(string userId)
    {
        return await _achievementRepo.GetUserAchievementsAsync(userId);
    }
}
