using BookTracker.Core.Entities;

namespace BookTracker.Core.Repositories;

/// <summary>
/// Contract for book series data access operations.
/// </summary>
public interface IBookSeriesRepository
{
    /// <summary>Gets all book series.</summary>
    Task<IEnumerable<BookSeries>> FetchAllAsync();

    /// <summary>Gets a single series by its id.</summary>
    Task<BookSeries?> FindByIdAsync(Guid seriesId);

    /// <summary>Gets the series that contains a given book.</summary>
    Task<BookSeries?> FindByBookAsync(Guid bookId);

    /// <summary>Persists a new book series.</summary>
    Task PersistAsync(BookSeries entity);

    /// <summary>Persists a new entry linking a book to a series.</summary>
    Task PersistEntryAsync(BookSeriesEntry entry);
}
