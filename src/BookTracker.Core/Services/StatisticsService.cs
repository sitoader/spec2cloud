using BookTracker.Core.Entities;
using BookTracker.Core.Repositories;
using Microsoft.Extensions.Logging;

namespace BookTracker.Core.Services;

/// <summary>
/// Orchestrates reading statistics and analytics operations.
/// </summary>
public class StatisticsService : IStatisticsService
{
    private readonly IBookRepository _bookRepo;
    private readonly IRatingRepository _ratingRepo;
    private readonly IReadingStreakRepository _streakRepo;
    private readonly IReadingSessionRepository _sessionRepo;
    private readonly ILogger<StatisticsService> _logger;

    public StatisticsService(
        IBookRepository bookRepo,
        IRatingRepository ratingRepo,
        IReadingStreakRepository streakRepo,
        IReadingSessionRepository sessionRepo,
        ILogger<StatisticsService> logger)
    {
        _bookRepo = bookRepo;
        _ratingRepo = ratingRepo;
        _streakRepo = streakRepo;
        _sessionRepo = sessionRepo;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<ReadingStatsOverview> ComputeOverviewAsync(string ownerId)
    {
        var result = await _bookRepo.GetByUserIdAsync(ownerId, null, 0, int.MaxValue);
        var allBooks = result.Books;
        var now = DateTime.UtcNow;

        var completedBooks = allBooks.Where(b => b.Status == BookStatus.Completed).ToList();
        var completedThisYear = completedBooks.Count(b => (b.CompletedDate ?? b.AddedDate).Year == now.Year);
        var completedThisMonth = completedBooks.Count(b =>
        {
            var d = b.CompletedDate ?? b.AddedDate;
            return d.Year == now.Year && d.Month == now.Month;
        });

        var ratedBooks = allBooks.Where(b => b.Rating is not null).ToList();
        var meanRating = ratedBooks.Count > 0
            ? Math.Round((decimal)ratedBooks.Average(b => b.Rating!.Score), 2)
            : 0m;

        // Total pages read = sum of PageCount for all completed books
        var totalPagesRead = completedBooks.Sum(b => b.PageCount ?? 0);

        var streak = await _streakRepo.FindByOwnerAsync(ownerId);
        var activeStreakDays = streak?.ActiveStreakDays ?? 0;

        _logger.LogInformation("Overview computed for owner {OwnerId}", ownerId);

        return new ReadingStatsOverview
        {
            TotalBooksOwned = completedBooks.Count,
            CompletedThisYear = completedThisYear,
            CompletedThisMonth = completedThisMonth,
            MeanRating = meanRating,
            CumulativePagesRead = totalPagesRead,
            ActiveStreakDays = activeStreakDays
        };
    }

    /// <inheritdoc />
    public async Task<IEnumerable<MonthlyBookTally>> ComputeMonthlyBreakdownAsync(string ownerId, int year)
    {
        var result = await _bookRepo.GetByUserIdAsync(ownerId, BookStatus.Completed, 0, int.MaxValue);
        var completedInYear = result.Books.Where(b => (b.CompletedDate ?? b.AddedDate).Year == year).ToList();

        var grouped = completedInYear
            .GroupBy(b => (b.CompletedDate ?? b.AddedDate).Month)
            .ToDictionary(g => g.Key, g => g.Count());

        var tallies = Enumerable.Range(1, 12)
            .Select(m => new MonthlyBookTally
            {
                MonthNumber = m,
                BookCount = grouped.GetValueOrDefault(m, 0)
            })
            .ToList();

        return tallies;
    }

    /// <inheritdoc />
    public async Task<IEnumerable<GenreTally>> ComputeGenreSpreadAsync(string ownerId)
    {
        var result = await _bookRepo.GetByUserIdAsync(ownerId, null, 0, int.MaxValue);

        var genreCounts = result.Books
            .Where(b => !string.IsNullOrWhiteSpace(b.Genres))
            .SelectMany(b => ParseGenres(b.Genres!))
            .GroupBy(g => g, StringComparer.OrdinalIgnoreCase)
            .Select(g => new GenreTally { GenreName = g.Key, BookCount = g.Count() })
            .OrderByDescending(t => t.BookCount)
            .ToList();

        return genreCounts;
    }

    /// <summary>
    /// Parses a genres string which may be a JSON array (e.g. '["Fantasy","Sci-Fi"]')
    /// or a plain comma-separated list. Returns individual genre names.
    /// </summary>
    private static IEnumerable<string> ParseGenres(string raw)
    {
        var trimmed = raw.Trim();
        if (trimmed.StartsWith('['))
        {
            try
            {
                var parsed = System.Text.Json.JsonSerializer.Deserialize<string[]>(trimmed);
                if (parsed is not null)
                    return parsed.Where(g => !string.IsNullOrWhiteSpace(g)).Select(g => g.Trim());
            }
            catch (System.Text.Json.JsonException)
            {
                // Fall through to comma-split
            }
        }

        return trimmed.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
    }

    /// <inheritdoc />
    public async Task<IEnumerable<AuthorTally>> ComputeTopAuthorsAsync(string ownerId)
    {
        var result = await _bookRepo.GetByUserIdAsync(ownerId, null, 0, int.MaxValue);

        var authorCounts = result.Books
            .GroupBy(b => b.Author, StringComparer.OrdinalIgnoreCase)
            .Select(g => new AuthorTally { AuthorName = g.Key, BookCount = g.Count() })
            .OrderByDescending(t => t.BookCount)
            .Take(10)
            .ToList();

        return authorCounts;
    }
}
