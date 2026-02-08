using BookTracker.Core.Entities;

namespace BookTracker.Core.Services;

/// <summary>
/// Contract for book series management operations.
/// </summary>
public interface ISeriesService
{
    /// <summary>Gets all series.</summary>
    Task<IEnumerable<BookSeries>> GetAllSeriesAsync();

    /// <summary>Gets a series by id.</summary>
    Task<BookSeries> GetSeriesAsync(Guid seriesId);

    /// <summary>Gets series for a specific book.</summary>
    Task<BookSeries?> GetSeriesByBookAsync(Guid bookId);

    /// <summary>Creates a new series with entries.</summary>
    Task<BookSeries> CreateSeriesAsync(string name, string? description, int? totalBooks, IEnumerable<(Guid BookId, int Position)> books);
}
