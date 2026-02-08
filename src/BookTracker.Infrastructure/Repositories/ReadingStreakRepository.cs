using BookTracker.Core.Entities;
using BookTracker.Core.Repositories;
using BookTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookTracker.Infrastructure.Repositories;

/// <summary>
/// EF Core implementation of <see cref="IReadingStreakRepository"/>.
/// </summary>
public class ReadingStreakRepository : IReadingStreakRepository
{
    private readonly ApplicationDbContext _db;

    public ReadingStreakRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    /// <inheritdoc />
    public async Task<ReadingStreak?> GetByUserIdAsync(string userId)
    {
        return await _db.ReadingStreaks
            .FirstOrDefaultAsync(s => s.UserId == userId);
    }

    /// <inheritdoc />
    public async Task AddAsync(ReadingStreak streak)
    {
        _db.ReadingStreaks.Add(streak);
        await _db.SaveChangesAsync();
    }

    /// <inheritdoc />
    public async Task UpdateAsync(ReadingStreak streak)
    {
        _db.ReadingStreaks.Update(streak);
        await _db.SaveChangesAsync();
    }
}
