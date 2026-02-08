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
    public async Task<ReadingProgress?> FindByOwnerAndBookAsync(string ownerId, Guid bookId)
    {
        return await _db.ReadingProgressRecords
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == ownerId && p.BookId == bookId);
    }

    /// <inheritdoc />
    public async Task PersistAsync(ReadingProgress entity)
    {
        _db.ReadingProgressRecords.Add(entity);
        await _db.SaveChangesAsync();
    }

    /// <inheritdoc />
    public async Task ModifyAsync(ReadingProgress entity)
    {
        _db.ReadingProgressRecords.Update(entity);
        await _db.SaveChangesAsync();
    }
}
