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
    public async Task<ReadingGoal?> GetByUserAndYearAsync(string userId, int year)
    {
        return await _db.ReadingGoals
            .FirstOrDefaultAsync(g => g.UserId == userId && g.Year == year);
    }

    /// <inheritdoc />
    public async Task AddAsync(ReadingGoal goal)
    {
        _db.ReadingGoals.Add(goal);
        await _db.SaveChangesAsync();
    }

    /// <inheritdoc />
    public async Task UpdateAsync(ReadingGoal goal)
    {
        _db.ReadingGoals.Update(goal);
        await _db.SaveChangesAsync();
    }
}
