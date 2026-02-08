using BookTracker.Core.Entities;
using BookTracker.Core.Repositories;
using BookTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookTracker.Infrastructure.Repositories;

/// <summary>
/// EF Core implementation of <see cref="IReadingGoalRepository"/>.
/// </summary>
public class ReadingGoalRepository : IReadingGoalRepository
{
    private readonly ApplicationDbContext _db;

    public ReadingGoalRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    /// <inheritdoc />
    public async Task<ReadingGoal?> FindByOwnerAndYearAsync(string ownerId, int targetYear)
    {
        return await _db.ReadingGoals
            .AsNoTracking()
            .FirstOrDefaultAsync(g => g.UserId == ownerId && g.TargetYear == targetYear);
    }

    /// <inheritdoc />
    public async Task PersistAsync(ReadingGoal entity)
    {
        _db.ReadingGoals.Add(entity);
        await _db.SaveChangesAsync();
    }

    /// <inheritdoc />
    public async Task ModifyAsync(ReadingGoal entity)
    {
        _db.ReadingGoals.Update(entity);
        await _db.SaveChangesAsync();
    }
}
