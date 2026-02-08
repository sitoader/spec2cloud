using BookTracker.Core.Entities;
using BookTracker.Core.Repositories;
using BookTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookTracker.Infrastructure.Repositories;

/// <summary>
/// EF Core implementation of <see cref="IBookReviewRepository"/>.
/// </summary>
public class BookReviewRepository : IBookReviewRepository
{
    private readonly ApplicationDbContext _db;

    public BookReviewRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    /// <inheritdoc />
    public async Task<IEnumerable<BookReview>> FetchByBookAsync(Guid bookId)
    {
        return await _db.BookReviews
            .AsNoTracking()
            .Where(r => r.BookId == bookId)
            .OrderByDescending(r => r.WrittenAt)
            .ToListAsync();
    }

    /// <inheritdoc />
    public async Task<IEnumerable<BookReview>> FetchByReviewerAsync(string reviewerId)
    {
        return await _db.BookReviews
            .AsNoTracking()
            .Where(r => r.UserId == reviewerId)
            .OrderByDescending(r => r.WrittenAt)
            .ToListAsync();
    }

    /// <inheritdoc />
    public async Task<BookReview?> FindByIdAsync(Guid reviewId)
    {
        return await _db.BookReviews
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == reviewId);
    }

    /// <inheritdoc />
    public async Task<BookReview?> FindByReviewerAndBookAsync(string reviewerId, Guid bookId)
    {
        return await _db.BookReviews
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.UserId == reviewerId && r.BookId == bookId);
    }

    /// <inheritdoc />
    public async Task PersistAsync(BookReview entity)
    {
        _db.BookReviews.Add(entity);
        await _db.SaveChangesAsync();
    }

    /// <inheritdoc />
    public async Task ModifyAsync(BookReview entity)
    {
        _db.BookReviews.Update(entity);
        await _db.SaveChangesAsync();
    }

    /// <inheritdoc />
    public async Task RemoveAsync(Guid reviewId)
    {
        var review = await _db.BookReviews.FindAsync(reviewId);
        if (review != null)
        {
            _db.BookReviews.Remove(review);
            await _db.SaveChangesAsync();
        }
    }
}
