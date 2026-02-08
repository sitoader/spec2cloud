using BookTracker.Core.Entities;
using BookTracker.Core.Exceptions;
using BookTracker.Core.Repositories;
using Microsoft.Extensions.Logging;

namespace BookTracker.Core.Services;

/// <summary>
/// Orchestrates book series operations.
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
    public async Task<IEnumerable<BookSeries>> GetAllSeriesAsync()
    {
        return await _seriesRepo.GetAllAsync();
    }

    /// <inheritdoc />
    public async Task<BookSeries> GetSeriesAsync(Guid seriesId)
    {
        var series = await _seriesRepo.GetByIdAsync(seriesId);
        if (series is null)
            throw new SeriesNotFoundException();
        return series;
    }

    /// <inheritdoc />
    public async Task<BookSeries?> GetSeriesByBookAsync(Guid bookId)
    {
        return await _seriesRepo.GetByBookIdAsync(bookId);
    }

    /// <inheritdoc />
    public async Task<BookSeries> CreateSeriesAsync(string name, string? description, int? totalBooks, IEnumerable<(Guid BookId, int Position)> books)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Series name is required.");

        var series = new BookSeries
        {
            Id = Guid.NewGuid(),
            Name = name,
            Description = description,
            TotalBooks = totalBooks,
            CreatedAt = DateTime.UtcNow
        };

        await _seriesRepo.AddAsync(series);

        foreach (var (bookId, position) in books)
        {
            var entry = new BookSeriesEntry
            {
                Id = Guid.NewGuid(),
                SeriesId = series.Id,
                BookId = bookId,
                PositionInSeries = position
            };
            await _seriesRepo.AddEntryAsync(entry);
        }

        _logger.LogInformation("Series created {SeriesId} with {Count} books", series.Id, books.Count());
        return series;
    }
}
