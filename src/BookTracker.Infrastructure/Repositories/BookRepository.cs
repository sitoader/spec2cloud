using BookTracker.Core.Entities;
using BookTracker.Core.Repositories;
using BookTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookTracker.Infrastructure.Repositories;

/// <summary>
/// EF Core implementation of <see cref="IBookRepository"/>.
/// </summary>
public class BookRepository : Core.Repositories.IBookRepository
{
    private readonly ApplicationDbContext _db;

    public BookRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    /// <inheritdoc />
    public async Task<(List<Book> Books, int TotalCount)> GetByUserIdAsync(
        string userId, BookStatus? status, int skip, int take)
    {
        var query = _db.Books
            .AsNoTracking()
            .Include(b => b.Rating)
            .Where(b => b.UserId == userId);

        if (status.HasValue)
            query = query.Where(b => b.Status == status.Value);

        var totalCount = await query.CountAsync();

        var books = await query
            .OrderByDescending(b => b.AddedDate)
            .Skip(skip)
            .Take(take)
            .ToListAsync();

        return (books, totalCount);
    }

    /// <inheritdoc />
    public async Task<Book?> GetByIdAsync(string userId, Guid bookId)
    {
        return await _db.Books
            .AsNoTracking()
            .Include(b => b.Rating)
            .FirstOrDefaultAsync(b => b.Id == bookId && b.UserId == userId);
    }

    /// <inheritdoc />
    public async Task<Book?> GetByIdAsync(Guid bookId)
    {
        return await _db.Books
            .AsNoTracking()
            .Include(b => b.Rating)
            .FirstOrDefaultAsync(b => b.Id == bookId);
    }

    /// <inheritdoc />
    public async Task AddAsync(Book book)
    {
        _db.Books.Add(book);
        await _db.SaveChangesAsync();
    }

    /// <inheritdoc />
    public async Task UpdateAsync(Book book)
    {
        _db.Books.Update(book);
        await _db.SaveChangesAsync();
    }

    /// <inheritdoc />
    public async Task DeleteAsync(Guid bookId)
    {
        var book = await _db.Books
            .Include(b => b.Rating)
            .FirstOrDefaultAsync(b => b.Id == bookId);

        if (book != null)
        {
            _db.Books.Remove(book);
            await _db.SaveChangesAsync();
        }
    }

    /// <inheritdoc />
    public async Task<bool> ExistsAsync(string userId, string title)
    {
        var normalizedTitle = title.ToUpperInvariant();
        return await _db.Books
            .AsNoTracking()
            .AnyAsync(b => b.UserId == userId &&
                           b.Title.ToUpperInvariant() == normalizedTitle);
    }
}
