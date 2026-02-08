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
    public async Task<IEnumerable<Achievement>> GetAllAsync()
    {
        return await _db.Achievements.ToListAsync();
    }

    /// <inheritdoc />
    public async Task<Achievement?> GetByCodeAsync(string code)
    {
        return await _db.Achievements
            .FirstOrDefaultAsync(a => a.Code == code);
    }

    /// <inheritdoc />
    public async Task<IEnumerable<UserAchievement>> GetUserAchievementsAsync(string userId)
    {
        return await _db.UserAchievements
            .Include(ua => ua.Achievement)
            .Where(ua => ua.UserId == userId)
            .ToListAsync();
    }

    /// <inheritdoc />
    public async Task<bool> HasAchievementAsync(string userId, Guid achievementId)
    {
        return await _db.UserAchievements
            .AnyAsync(ua => ua.UserId == userId && ua.AchievementId == achievementId);
    }

    /// <inheritdoc />
    public async Task AddUserAchievementAsync(UserAchievement userAchievement)
    {
        _db.UserAchievements.Add(userAchievement);
        await _db.SaveChangesAsync();
    }
}
