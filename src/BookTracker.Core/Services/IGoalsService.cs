using BookTracker.Core.Entities;

namespace BookTracker.Core.Services;

/// <summary>
/// Contract for reading goals and achievements management.
/// </summary>
public interface IGoalsService
{
    /// <summary>Creates or updates a reading goal.</summary>
    Task<ReadingGoal> SetGoalAsync(string userId, int year, int targetBooksCount);

    /// <summary>Gets the reading goal for a year.</summary>
    Task<ReadingGoal?> GetGoalAsync(string userId, int year);

    /// <summary>Gets all available achievements.</summary>
    Task<IEnumerable<Achievement>> GetAllAchievementsAsync();

    /// <summary>Gets achievements unlocked by a user.</summary>
    Task<IEnumerable<UserAchievement>> GetUserAchievementsAsync(string userId);
}
