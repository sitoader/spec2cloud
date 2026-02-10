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
    public async Task<IEnumerable<Collection>> FetchByOwnerAsync(string ownerId)
    {
        return await _db.Collections
            .AsNoTracking()
            .Include(c => c.Items)
            .Where(c => c.UserId == ownerId)
            .ToListAsync();
    }

    /// <inheritdoc />
    public async Task<Collection?> FindByIdAsync(Guid collectionId)
    {
        return await _db.Collections
            .AsNoTracking()
            .Include(c => c.Items)
                .ThenInclude(i => i.LinkedBook)
            .FirstOrDefaultAsync(c => c.Id == collectionId);
    }

    /// <inheritdoc />
    public async Task PersistAsync(Collection entity)
    {
        _db.Collections.Add(entity);
        await _db.SaveChangesAsync();
    }

    /// <inheritdoc />
    public async Task ModifyAsync(Collection entity)
    {
        _db.Collections.Update(entity);
        await _db.SaveChangesAsync();
    }

    /// <inheritdoc />
    public async Task RemoveAsync(Guid collectionId)
    {
        var collection = await _db.Collections.FindAsync(collectionId);
        if (collection != null)
        {
            _db.Collections.Remove(collection);
            await _db.SaveChangesAsync();
        }
    }

    /// <inheritdoc />
    public async Task AttachBookAsync(CollectionBook link)
    {
        _db.CollectionBooks.Add(link);
        await _db.SaveChangesAsync();
    }

    /// <inheritdoc />
    public async Task DetachBookAsync(Guid collectionId, Guid bookId)
    {
        var link = await _db.CollectionBooks
            .FirstOrDefaultAsync(cb => cb.CollectionId == collectionId && cb.BookId == bookId);

        if (link != null)
        {
            _db.CollectionBooks.Remove(link);
            await _db.SaveChangesAsync();
        }
    }

    /// <inheritdoc />
    public async Task<IEnumerable<Collection>> FetchVisibleAsync(string? searchTerm)
    {
        var query = _db.Collections
            .AsNoTracking()
            .Include(c => c.Items)
            .Where(c => c.IsVisible);

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(c =>
                c.Label.Contains(searchTerm) ||
                (c.Summary != null && c.Summary.Contains(searchTerm)));
        }

        return await query.ToListAsync();
    }

    /// <inheritdoc />
    public async Task<IEnumerable<Collection>> FetchByBookAsync(string ownerId, Guid bookId)
    {
        return await _db.Collections
            .AsNoTracking()
            .Include(c => c.Items)
            .Where(c => c.UserId == ownerId && c.Items.Any(i => i.BookId == bookId))
            .ToListAsync();
    }
}
