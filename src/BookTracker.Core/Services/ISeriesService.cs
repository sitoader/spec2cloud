using BookTracker.Core.Entities;

namespace BookTracker.Core.Services;

/// <summary>
/// Contract for book series management operations.
/// </summary>
public interface ISeriesService
{
    /// <summary>Lists all book series.</summary>
    Task<IEnumerable<BookSeries>> ListAllSeriesAsync();

    /// <summary>Fetches a book series by its identifier.</summary>
    Task<BookSeries?> FetchSeriesAsync(Guid seriesId);

    /// <summary>Fetches the book series that contains the specified book.</summary>
    Task<BookSeries?> FetchSeriesByBookAsync(Guid bookId);

    /// <summary>Registers a new book series with its members.</summary>
    Task<BookSeries> RegisterSeriesAsync(string seriesTitle, (Guid BookId, int OrderIndex)[] members);
}
