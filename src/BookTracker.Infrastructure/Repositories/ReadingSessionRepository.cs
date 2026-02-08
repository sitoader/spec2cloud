using BookTracker.Core.Entities;
using BookTracker.Core.Repositories;
using BookTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookTracker.Infrastructure.Repositories;

/// <summary>
/// EF Core implementation of <see cref="IReadingSessionRepository"/>.
/// </summary>
public class ReadingSessionRepository : IReadingSessionRepository
{
    private readonly ApplicationDbContext _db;

    public ReadingSessionRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    /// <inheritdoc />
    public async Task<IEnumerable<ReadingSession>> FetchByOwnerAndBookAsync(string ownerId, Guid bookId)
    {
        return await _db.ReadingSessions
            .AsNoTracking()
            .Where(s => s.UserId == ownerId && s.BookId == bookId)
            .OrderByDescending(s => s.SessionStart)
            .ToListAsync();
    }

    /// <inheritdoc />
    public async Task<IEnumerable<ReadingSession>> FetchByOwnerAsync(string ownerId, DateTime? from, DateTime? until)
    {
        var query = _db.ReadingSessions
            .AsNoTracking()
            .Where(s => s.UserId == ownerId);

        if (from.HasValue)
            query = query.Where(s => s.SessionStart >= from.Value);

        if (until.HasValue)
            query = query.Where(s => s.SessionStart <= until.Value);

        return await query
            .OrderByDescending(s => s.SessionStart)
            .ToListAsync();
    }

    /// <inheritdoc />
    public async Task<ReadingSession?> FindByIdAsync(Guid sessionId)
    {
        return await _db.ReadingSessions
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == sessionId);
    }

    /// <inheritdoc />
    public async Task PersistAsync(ReadingSession entity)
    {
        _db.ReadingSessions.Add(entity);
        await _db.SaveChangesAsync();
    }
}
