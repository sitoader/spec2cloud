using BookTracker.Core.Entities;
using BookTracker.Core.Repositories;
using Microsoft.Extensions.Logging;

namespace BookTracker.Core.Services;

/// <summary>
/// Orchestrates achievement and badge operations.
/// </summary>
public class AchievementService : IAchievementService
{
    private readonly IAchievementRepository _achievementRepo;
    private readonly ILogger<AchievementService> _logger;

    public AchievementService(IAchievementRepository achievementRepo, ILogger<AchievementService> logger)
    {
        _achievementRepo = achievementRepo;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<IEnumerable<Achievement>> ListAllBadgesAsync()
    {
        return await _achievementRepo.FetchAllDefinitionsAsync();
    }

    /// <inheritdoc />
    public async Task<IEnumerable<UserAchievement>> ListEarnedBadgesAsync(string ownerId)
    {
        _logger.LogInformation("Fetching earned badges for owner {OwnerId}", ownerId);
        return await _achievementRepo.FetchEarnedByOwnerAsync(ownerId);
    }
}
