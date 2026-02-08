using BookTracker.Core.Entities;

namespace BookTracker.Core.Repositories;

/// <summary>
/// Contract for achievement data access operations.
/// </summary>
public interface IAchievementRepository
{
    /// <summary>Gets all achievements.</summary>
    Task<IEnumerable<Achievement>> GetAllAsync();

    /// <summary>Gets an achievement by code.</summary>
    Task<Achievement?> GetByCodeAsync(string code);

    /// <summary>Gets achievements unlocked by a user.</summary>
    Task<IEnumerable<UserAchievement>> GetUserAchievementsAsync(string userId);

    /// <summary>Checks if user has a specific achievement.</summary>
    Task<bool> HasAchievementAsync(string userId, Guid achievementId);

    /// <summary>Unlocks an achievement for a user.</summary>
    Task AddUserAchievementAsync(UserAchievement userAchievement);
}
