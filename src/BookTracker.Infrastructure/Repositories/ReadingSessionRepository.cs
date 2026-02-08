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
    public async Task<IEnumerable<ReadingSession>> GetByBookIdAsync(string userId, Guid bookId)
    {
        return await _db.ReadingSessions
            .Where(s => s.UserId == userId && s.BookId == bookId)
            .OrderByDescending(s => s.StartTime)
            .ToListAsync();
    }

    /// <inheritdoc />
    public async Task<IEnumerable<ReadingSession>> GetByDateRangeAsync(string userId, DateTime? startDate, DateTime? endDate)
    {
        var query = _db.ReadingSessions.Where(s => s.UserId == userId);
        if (startDate.HasValue) query = query.Where(s => s.StartTime >= startDate.Value);
        if (endDate.HasValue) query = query.Where(s => s.StartTime <= endDate.Value);
        return await query.OrderByDescending(s => s.StartTime).ToListAsync();
    }

    /// <inheritdoc />
    public async Task<ReadingSession?> GetByIdAsync(Guid sessionId)
    {
        return await _db.ReadingSessions.FindAsync(sessionId);
    }

    /// <inheritdoc />
    public async Task AddAsync(ReadingSession session)
    {
        _db.ReadingSessions.Add(session);
        await _db.SaveChangesAsync();
    }
}
