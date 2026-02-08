using BookTracker.Core.Entities;
using BookTracker.Core.Repositories;
using BookTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookTracker.Infrastructure.Repositories;

/// <summary>
/// EF Core implementation of <see cref="ICollectionRepository"/>.
/// </summary>
public class CollectionRepository : ICollectionRepository
{
    private readonly ApplicationDbContext _db;

    public CollectionRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    /// <inheritdoc />
    public async Task<IEnumerable<Collection>> GetByUserIdAsync(string userId)
    {
        return await _db.Collections
            .Include(c => c.CollectionBooks)
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.UpdatedAt)
            .ToListAsync();
    }

    /// <inheritdoc />
    public async Task<Collection?> GetByIdAsync(Guid collectionId)
    {
        return await _db.Collections
            .Include(c => c.CollectionBooks)
            .FirstOrDefaultAsync(c => c.Id == collectionId);
    }

    /// <inheritdoc />
    public async Task<IEnumerable<Collection>> GetPublicAsync(string? search)
    {
        var query = _db.Collections
            .Include(c => c.CollectionBooks)
            .Where(c => c.IsPublic);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(c => c.Name.Contains(search));

        return await query.OrderByDescending(c => c.UpdatedAt).ToListAsync();
    }

    /// <inheritdoc />
    public async Task AddAsync(Collection collection)
    {
        _db.Collections.Add(collection);
        await _db.SaveChangesAsync();
    }

    /// <inheritdoc />
    public async Task UpdateAsync(Collection collection)
    {
        _db.Collections.Update(collection);
        await _db.SaveChangesAsync();
    }

    /// <inheritdoc />
    public async Task DeleteAsync(Guid collectionId)
    {
        var collection = await _db.Collections.FindAsync(collectionId);
        if (collection != null)
        {
            _db.Collections.Remove(collection);
            await _db.SaveChangesAsync();
        }
    }

    /// <inheritdoc />
    public async Task AddBookAsync(CollectionBook collectionBook)
    {
        _db.CollectionBooks.Add(collectionBook);
        await _db.SaveChangesAsync();
    }

    /// <inheritdoc />
    public async Task RemoveBookAsync(Guid collectionId, Guid bookId)
    {
        var entry = await _db.CollectionBooks
            .FirstOrDefaultAsync(cb => cb.CollectionId == collectionId && cb.BookId == bookId);
        if (entry != null)
        {
            _db.CollectionBooks.Remove(entry);
            await _db.SaveChangesAsync();
        }
    }

    /// <inheritdoc />
    public async Task<CollectionBook?> GetCollectionBookAsync(Guid collectionId, Guid bookId)
    {
        return await _db.CollectionBooks
            .FirstOrDefaultAsync(cb => cb.CollectionId == collectionId && cb.BookId == bookId);
    }
}
