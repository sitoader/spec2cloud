using BookTracker.Core.Entities;
using BookTracker.Core.Repositories;
using Microsoft.Extensions.Logging;

namespace BookTracker.Core.Services;

/// <summary>
/// Orchestrates book series management operations.
/// </summary>
public class SeriesService : ISeriesService
{
    private readonly IBookSeriesRepository _seriesRepo;
    private readonly ILogger<SeriesService> _logger;

    public SeriesService(IBookSeriesRepository seriesRepo, ILogger<SeriesService> logger)
    {
        _seriesRepo = seriesRepo;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<IEnumerable<BookSeries>> ListAllSeriesAsync()
    {
        return await _seriesRepo.FetchAllAsync();
    }

    /// <inheritdoc />
    public async Task<BookSeries?> FetchSeriesAsync(Guid seriesId)
    {
        return await _seriesRepo.FindByIdAsync(seriesId);
    }

    /// <inheritdoc />
    public async Task<BookSeries?> FetchSeriesByBookAsync(Guid bookId)
    {
        return await _seriesRepo.FindByBookAsync(bookId);
    }

    /// <inheritdoc />
    public async Task<BookSeries> RegisterSeriesAsync(string seriesTitle, (Guid BookId, int OrderIndex)[] members)
    {
        if (string.IsNullOrWhiteSpace(seriesTitle))
            throw new ArgumentException("Series title must not be empty.");

        var series = new BookSeries
        {
            Id = Guid.NewGuid(),
            SeriesTitle = seriesTitle.Trim(),
            RegisteredAt = DateTime.UtcNow
        };

        await _seriesRepo.PersistAsync(series);

        foreach (var member in members)
        {
            var entry = new BookSeriesEntry
            {
                Id = Guid.NewGuid(),
                SeriesId = series.Id,
                BookId = member.BookId,
                OrderIndex = member.OrderIndex
            };
            await _seriesRepo.PersistEntryAsync(entry);
        }

        _logger.LogInformation("Series registered {SeriesId} with {MemberCount} members", series.Id, members.Length);
        return series;
    }
}
