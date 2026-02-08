using BookTracker.Core.Entities;

namespace BookTracker.Core.Services;

/// <summary>
/// Contract for achievement and badge operations.
/// </summary>
public interface IAchievementService
{
    /// <summary>Lists all available badges.</summary>
    Task<IEnumerable<Achievement>> ListAllBadgesAsync();

    /// <summary>Lists badges earned by the specified owner.</summary>
    Task<IEnumerable<UserAchievement>> ListEarnedBadgesAsync(string ownerId);
}
