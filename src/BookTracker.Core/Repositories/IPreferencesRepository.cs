using BookTracker.Core.Entities;

namespace BookTracker.Core.Repositories;

/// <summary>
/// Contract for user preferences data access operations.
/// </summary>
public interface IPreferencesRepository
{
    /// <summary>Gets preferences by user id.</summary>
    Task<UserPreferences?> GetByUserIdAsync(string userId);

    /// <summary>Adds new preferences.</summary>
    Task AddAsync(UserPreferences preferences);

    /// <summary>Updates existing preferences.</summary>
    Task UpdateAsync(UserPreferences preferences);
}
