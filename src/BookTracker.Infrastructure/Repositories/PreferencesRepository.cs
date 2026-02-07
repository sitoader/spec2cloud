using BookTracker.Core.Entities;
using BookTracker.Core.Repositories;
using BookTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookTracker.Infrastructure.Repositories;

/// <summary>
/// EF Core implementation of <see cref="IPreferencesRepository"/>.
/// </summary>
public class PreferencesRepository : IPreferencesRepository
{
    private readonly ApplicationDbContext _db;

    public PreferencesRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    /// <inheritdoc />
    public async Task<UserPreferences?> GetByUserIdAsync(string userId)
    {
        return await _db.UserPreferences
            .FirstOrDefaultAsync(p => p.UserId == userId);
    }

    /// <inheritdoc />
    public async Task AddAsync(UserPreferences preferences)
    {
        _db.UserPreferences.Add(preferences);
        await _db.SaveChangesAsync();
    }

    /// <inheritdoc />
    public async Task UpdateAsync(UserPreferences preferences)
    {
        _db.UserPreferences.Update(preferences);
        await _db.SaveChangesAsync();
    }
}
