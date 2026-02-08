using BookTracker.Core.Entities;
using BookTracker.Core.Repositories;
using BookTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookTracker.Infrastructure.Repositories;

/// <summary>
/// EF Core implementation of <see cref="IBookSeriesRepository"/>.
/// </summary>
public class BookSeriesRepository : IBookSeriesRepository
{
    private readonly ApplicationDbContext _db;

    public BookSeriesRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    /// <inheritdoc />
    public async Task<IEnumerable<BookSeries>> FetchAllAsync()
    {
        return await _db.BookSeriesSet
            .AsNoTracking()
            .Include(s => s.Members)
            .ToListAsync();
    }

    /// <inheritdoc />
    public async Task<BookSeries?> FindByIdAsync(Guid seriesId)
    {
        return await _db.BookSeriesSet
            .AsNoTracking()
            .Include(s => s.Members)
            .FirstOrDefaultAsync(s => s.Id == seriesId);
    }

    /// <inheritdoc />
    public async Task<BookSeries?> FindByBookAsync(Guid bookId)
    {
        var entry = await _db.BookSeriesEntries
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.BookId == bookId);

        if (entry == null)
            return null;

        return await _db.BookSeriesSet
            .AsNoTracking()
            .Include(s => s.Members)
            .FirstOrDefaultAsync(s => s.Id == entry.SeriesId);
    }

    /// <inheritdoc />
    public async Task PersistAsync(BookSeries entity)
    {
        _db.BookSeriesSet.Add(entity);
        await _db.SaveChangesAsync();
    }

    /// <inheritdoc />
    public async Task PersistEntryAsync(BookSeriesEntry entry)
    {
        _db.BookSeriesEntries.Add(entry);
        await _db.SaveChangesAsync();
    }
}
