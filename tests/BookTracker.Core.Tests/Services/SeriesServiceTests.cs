using BookTracker.Core.Entities;
using BookTracker.Core.Exceptions;
using BookTracker.Core.Repositories;
using BookTracker.Core.Services;
using Microsoft.Extensions.Logging;
using NSubstitute;
using NSubstitute.ReturnsExtensions;

namespace BookTracker.Core.Tests.Services;

/// <summary>
/// Unit tests for <see cref="SeriesService"/>.
/// </summary>
public class SeriesServiceTests
{
    private readonly IBookSeriesRepository _seriesRepo;
    private readonly SeriesService _svc;

    public SeriesServiceTests()
    {
        _seriesRepo = Substitute.For<IBookSeriesRepository>();
        var logger = Substitute.For<ILogger<SeriesService>>();
        _svc = new SeriesService(_seriesRepo, logger);
    }

    [Fact]
    public async Task CreateSeriesAsync_CreatesSeries()
    {
        var books = new List<(Guid BookId, int Position)>
        {
            (Guid.NewGuid(), 1),
            (Guid.NewGuid(), 2)
        };

        var result = await _svc.CreateSeriesAsync("Harry Potter", "Wizard series", 7, books);

        Assert.Equal("Harry Potter", result.Name);
        Assert.Equal(7, result.TotalBooks);
        await _seriesRepo.Received(1).AddAsync(Arg.Any<BookSeries>());
        await _seriesRepo.Received(2).AddEntryAsync(Arg.Any<BookSeriesEntry>());
    }

    [Fact]
    public async Task CreateSeriesAsync_ThrowsArgException_WhenNameEmpty()
    {
        await Assert.ThrowsAsync<ArgumentException>(
            () => _svc.CreateSeriesAsync("", null, null, Array.Empty<(Guid, int)>()));
    }

    [Fact]
    public async Task GetSeriesAsync_ReturnsSeries()
    {
        var seriesId = Guid.NewGuid();
        var series = new BookSeries { Id = seriesId, Name = "Test Series", CreatedAt = DateTime.UtcNow };
        _seriesRepo.GetByIdAsync(seriesId).Returns(series);

        var result = await _svc.GetSeriesAsync(seriesId);

        Assert.Equal("Test Series", result.Name);
    }

    [Fact]
    public async Task GetSeriesAsync_ThrowsSeriesNotFound()
    {
        _seriesRepo.GetByIdAsync(Arg.Any<Guid>()).ReturnsNull();

        await Assert.ThrowsAsync<SeriesNotFoundException>(
            () => _svc.GetSeriesAsync(Guid.NewGuid()));
    }

    [Fact]
    public async Task GetSeriesByBookAsync_ReturnsSeries()
    {
        var bookId = Guid.NewGuid();
        var series = new BookSeries { Id = Guid.NewGuid(), Name = "Test Series", CreatedAt = DateTime.UtcNow };
        _seriesRepo.GetByBookIdAsync(bookId).Returns(series);

        var result = await _svc.GetSeriesByBookAsync(bookId);

        Assert.NotNull(result);
        Assert.Equal("Test Series", result.Name);
    }

    [Fact]
    public async Task GetSeriesByBookAsync_ReturnsNull_WhenNotInSeries()
    {
        _seriesRepo.GetByBookIdAsync(Arg.Any<Guid>()).ReturnsNull();

        var result = await _svc.GetSeriesByBookAsync(Guid.NewGuid());

        Assert.Null(result);
    }
}
