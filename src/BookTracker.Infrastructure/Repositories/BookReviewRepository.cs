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
    public async Task<IEnumerable<BookReview>> GetByBookIdAsync(Guid bookId)
    {
        return await _db.BookReviews
            .Where(r => r.BookId == bookId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    /// <inheritdoc />
    public async Task<IEnumerable<BookReview>> GetByUserIdAsync(string userId)
    {
        return await _db.BookReviews
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    /// <inheritdoc />
    public async Task<BookReview?> GetByIdAsync(Guid reviewId)
    {
        return await _db.BookReviews.FindAsync(reviewId);
    }

    /// <inheritdoc />
    public async Task<BookReview?> GetByUserAndBookAsync(string userId, Guid bookId)
    {
        return await _db.BookReviews
            .FirstOrDefaultAsync(r => r.UserId == userId && r.BookId == bookId);
    }

    /// <inheritdoc />
    public async Task AddAsync(BookReview review)
    {
        _db.BookReviews.Add(review);
        await _db.SaveChangesAsync();
    }

    /// <inheritdoc />
    public async Task UpdateAsync(BookReview review)
    {
        _db.BookReviews.Update(review);
        await _db.SaveChangesAsync();
    }

    /// <inheritdoc />
    public async Task DeleteAsync(Guid reviewId)
    {
        var review = await _db.BookReviews.FindAsync(reviewId);
        if (review != null)
        {
            _db.BookReviews.Remove(review);
            await _db.SaveChangesAsync();
        }
    }
}
