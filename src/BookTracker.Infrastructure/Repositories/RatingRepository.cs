using BookTracker.Core.Entities;
using BookTracker.Core.Repositories;
using BookTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookTracker.Infrastructure.Repositories;

/// <summary>
/// EF Core implementation of <see cref="IRatingRepository"/>.
/// </summary>
public class RatingRepository : IRatingRepository
{
    private readonly ApplicationDbContext _db;

    public RatingRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    /// <inheritdoc />
    public async Task<Rating?> GetByBookIdAsync(Guid bookId)
    {
        return await _db.Ratings
            .FirstOrDefaultAsync(r => r.BookId == bookId);
    }

    /// <inheritdoc />
    public async Task AddAsync(Rating rating)
    {
        _db.Ratings.Add(rating);
        await _db.SaveChangesAsync();
    }

    /// <inheritdoc />
    public async Task UpdateAsync(Rating rating)
    {
        _db.Ratings.Update(rating);
        await _db.SaveChangesAsync();
    }

    /// <inheritdoc />
    public async Task DeleteAsync(Guid ratingId)
    {
        var rating = await _db.Ratings.FindAsync(ratingId);
        if (rating != null)
        {
            _db.Ratings.Remove(rating);
            await _db.SaveChangesAsync();
        }
    }
}
