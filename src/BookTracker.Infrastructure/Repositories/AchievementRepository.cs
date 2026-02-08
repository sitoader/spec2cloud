using BookTracker.Core.Entities;
using BookTracker.Core.Repositories;
using BookTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookTracker.Infrastructure.Repositories;

/// <summary>
/// EF Core implementation of <see cref="IAchievementRepository"/>.
/// </summary>
public class AchievementRepository : IAchievementRepository
{
    private readonly ApplicationDbContext _db;

    public AchievementRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    /// <inheritdoc />
    public async Task<IEnumerable<Achievement>> FetchAllDefinitionsAsync()
    {
        return await _db.Achievements
            .AsNoTracking()
            .ToListAsync();
    }

    /// <inheritdoc />
    public async Task<Achievement?> FindBySlugAsync(string slug)
    {
        return await _db.Achievements
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Slug == slug);
    }

    /// <inheritdoc />
    public async Task<IEnumerable<UserAchievement>> FetchEarnedByOwnerAsync(string ownerId)
    {
        return await _db.UserAchievements
            .AsNoTracking()
            .Include(ua => ua.Badge)
            .Where(ua => ua.UserId == ownerId)
            .ToListAsync();
    }

    /// <inheritdoc />
    public async Task<bool> OwnerHasEarnedAsync(string ownerId, Guid achievementId)
    {
        return await _db.UserAchievements
            .AsNoTracking()
            .AnyAsync(ua => ua.UserId == ownerId && ua.AchievementId == achievementId);
    }

    /// <inheritdoc />
    public async Task GrantToOwnerAsync(UserAchievement record)
    {
        _db.UserAchievements.Add(record);
        await _db.SaveChangesAsync();
    }
}
