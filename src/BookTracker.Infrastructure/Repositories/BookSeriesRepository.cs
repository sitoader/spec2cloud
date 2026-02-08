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
    public async Task<IEnumerable<BookSeries>> GetAllAsync()
    {
        return await _db.BookSeries
            .Include(s => s.Entries)
            .OrderBy(s => s.Name)
            .ToListAsync();
    }

    /// <inheritdoc />
    public async Task<BookSeries?> GetByIdAsync(Guid seriesId)
    {
        return await _db.BookSeries
            .Include(s => s.Entries)
            .FirstOrDefaultAsync(s => s.Id == seriesId);
    }

    /// <inheritdoc />
    public async Task<BookSeries?> GetByBookIdAsync(Guid bookId)
    {
        var entry = await _db.BookSeriesEntries
            .Include(e => e.Series)
            .FirstOrDefaultAsync(e => e.BookId == bookId);
        return entry?.Series;
    }

    /// <inheritdoc />
    public async Task AddAsync(BookSeries series)
    {
        _db.BookSeries.Add(series);
        await _db.SaveChangesAsync();
    }

    /// <inheritdoc />
    public async Task AddEntryAsync(BookSeriesEntry entry)
    {
        _db.BookSeriesEntries.Add(entry);
        await _db.SaveChangesAsync();
    }
}
