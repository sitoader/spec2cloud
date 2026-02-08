using BookTracker.Core.Entities;
using BookTracker.Core.Repositories;
using BookTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookTracker.Infrastructure.Repositories;

/// <summary>
/// EF Core implementation of <see cref="IReadingProgressRepository"/>.
/// </summary>
public class ReadingProgressRepository : IReadingProgressRepository
{
    private readonly ApplicationDbContext _db;

    public ReadingProgressRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    /// <inheritdoc />
    public async Task<ReadingProgress?> GetByUserAndBookAsync(string userId, Guid bookId)
    {
        return await _db.ReadingProgress
            .FirstOrDefaultAsync(p => p.UserId == userId && p.BookId == bookId);
    }

    /// <inheritdoc />
    public async Task AddAsync(ReadingProgress progress)
    {
        _db.ReadingProgress.Add(progress);
        await _db.SaveChangesAsync();
    }

    /// <inheritdoc />
    public async Task UpdateAsync(ReadingProgress progress)
    {
        _db.ReadingProgress.Update(progress);
        await _db.SaveChangesAsync();
    }
}
