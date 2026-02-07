using BookTracker.Core.Entities;

namespace BookTracker.Core.Repositories;

/// <summary>
/// Contract for rating data access operations.
/// </summary>
public interface IRatingRepository
{
    /// <summary>Gets a rating by book id.</summary>
    Task<Rating?> GetByBookIdAsync(Guid bookId);

    /// <summary>Adds a new rating.</summary>
    Task AddAsync(Rating rating);

    /// <summary>Updates an existing rating.</summary>
    Task UpdateAsync(Rating rating);

    /// <summary>Deletes a rating by id.</summary>
    Task DeleteAsync(Guid ratingId);
}
