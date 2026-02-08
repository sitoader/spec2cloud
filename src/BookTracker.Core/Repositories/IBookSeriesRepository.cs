using BookTracker.Core.Entities;

namespace BookTracker.Core.Repositories;

/// <summary>
/// Contract for book series data access operations.
/// </summary>
public interface IBookSeriesRepository
{
    /// <summary>Gets all series.</summary>
    Task<IEnumerable<BookSeries>> GetAllAsync();

    /// <summary>Gets a series by id with entries.</summary>
    Task<BookSeries?> GetByIdAsync(Guid seriesId);

    /// <summary>Gets series for a specific book.</summary>
    Task<BookSeries?> GetByBookIdAsync(Guid bookId);

    /// <summary>Creates a new series.</summary>
    Task AddAsync(BookSeries series);

    /// <summary>Adds an entry to a series.</summary>
    Task AddEntryAsync(BookSeriesEntry entry);
}
