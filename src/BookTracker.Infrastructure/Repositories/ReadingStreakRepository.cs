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
    public async Task<ReadingStreak?> FindByOwnerAsync(string ownerId)
    {
        return await _db.ReadingStreaks
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.UserId == ownerId);
    }

    /// <inheritdoc />
    public async Task PersistAsync(ReadingStreak entity)
    {
        _db.ReadingStreaks.Add(entity);
        await _db.SaveChangesAsync();
    }

    /// <inheritdoc />
    public async Task ModifyAsync(ReadingStreak entity)
    {
        _db.ReadingStreaks.Update(entity);
        await _db.SaveChangesAsync();
    }
}
