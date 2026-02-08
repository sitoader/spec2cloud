using BookTracker.Core.Entities;

namespace BookTracker.Core.Repositories;

/// <summary>
/// Contract for achievement and user-achievement data access operations.
/// </summary>
public interface IAchievementRepository
{
    /// <summary>Gets all achievement definitions.</summary>
    Task<IEnumerable<Achievement>> FetchAllDefinitionsAsync();

    /// <summary>Gets a single achievement by its slug.</summary>
    Task<Achievement?> FindBySlugAsync(string slug);

    /// <summary>Gets all achievements earned by a given owner.</summary>
    Task<IEnumerable<UserAchievement>> FetchEarnedByOwnerAsync(string ownerId);

    /// <summary>Checks whether an owner has already earned a specific achievement.</summary>
    Task<bool> OwnerHasEarnedAsync(string ownerId, Guid achievementId);

    /// <summary>Grants an achievement to an owner.</summary>
    Task GrantToOwnerAsync(UserAchievement record);
}
