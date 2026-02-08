using BookTracker.Core.Entities;
using BookTracker.Core.Repositories;
using BookTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookTracker.Infrastructure.Repositories;

/// <summary>
/// EF Core implementation of <see cref="IFollowedAuthorRepository"/>.
/// </summary>
public class FollowedAuthorRepository : IFollowedAuthorRepository
{
    private readonly ApplicationDbContext _db;

    public FollowedAuthorRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    /// <inheritdoc />
    public async Task<IEnumerable<FollowedAuthor>> FetchByOwnerAsync(string ownerId)
    {
        return await _db.FollowedAuthors
            .AsNoTracking()
            .Where(f => f.UserId == ownerId)
            .OrderBy(f => f.AuthorName)
            .ToListAsync();
    }

    /// <inheritdoc />
    public async Task<FollowedAuthor?> FindByOwnerAndAuthorAsync(string ownerId, string authorName)
    {
        return await _db.FollowedAuthors
            .AsNoTracking()
            .FirstOrDefaultAsync(f => f.UserId == ownerId && f.AuthorName == authorName);
    }

    /// <inheritdoc />
    public async Task PersistAsync(FollowedAuthor entity)
    {
        _db.FollowedAuthors.Add(entity);
        await _db.SaveChangesAsync();
    }

    /// <inheritdoc />
    public async Task RemoveAsync(string ownerId, string authorName)
    {
        var entity = await _db.FollowedAuthors
            .FirstOrDefaultAsync(f => f.UserId == ownerId && f.AuthorName == authorName);

        if (entity != null)
        {
            _db.FollowedAuthors.Remove(entity);
            await _db.SaveChangesAsync();
        }
    }
}
