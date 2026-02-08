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
    public async Task<IEnumerable<FollowedAuthor>> GetByUserIdAsync(string userId)
    {
        return await _db.FollowedAuthors
            .Where(fa => fa.UserId == userId)
            .OrderBy(fa => fa.AuthorName)
            .ToListAsync();
    }

    /// <inheritdoc />
    public async Task<FollowedAuthor?> GetByUserAndAuthorAsync(string userId, string authorName)
    {
        return await _db.FollowedAuthors
            .FirstOrDefaultAsync(fa => fa.UserId == userId && fa.AuthorName == authorName);
    }

    /// <inheritdoc />
    public async Task AddAsync(FollowedAuthor followedAuthor)
    {
        _db.FollowedAuthors.Add(followedAuthor);
        await _db.SaveChangesAsync();
    }

    /// <inheritdoc />
    public async Task DeleteAsync(Guid followedAuthorId)
    {
        var entry = await _db.FollowedAuthors.FindAsync(followedAuthorId);
        if (entry != null)
        {
            _db.FollowedAuthors.Remove(entry);
            await _db.SaveChangesAsync();
        }
    }
}
