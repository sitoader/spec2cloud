using BookTracker.Core.Entities;
using BookTracker.Core.Repositories;
using Microsoft.Extensions.Logging;

namespace BookTracker.Core.Services;

/// <summary>
/// Provides reading statistics and analytics.
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
    public async Task<StatisticsOverview> GetOverviewAsync(string userId)
    {
        var allBooks = await _bookRepo.GetByUserIdAsync(userId, null, 0, int.MaxValue);
        var streak = await _streakRepo.GetByUserIdAsync(userId);
        var now = DateTime.UtcNow;

        var totalBooks = allBooks.Books.Count;
        var booksThisYear = allBooks.Books.Count(b => b.AddedDate.Year == now.Year && b.Status == BookStatus.Completed);
        var booksThisMonth = allBooks.Books.Count(b => b.AddedDate.Year == now.Year && b.AddedDate.Month == now.Month && b.Status == BookStatus.Completed);

        var ratings = new List<int>();
        foreach (var book in allBooks.Books)
        {
            if (book.Rating is not null)
                ratings.Add(book.Rating.Score);
        }

        var sessions = await _sessionRepo.GetByDateRangeAsync(userId, null, null);
        var totalPagesRead = sessions.Sum(s => s.PagesRead ?? 0);

        return new StatisticsOverview
        {
            TotalBooks = totalBooks,
            BooksThisYear = booksThisYear,
            BooksThisMonth = booksThisMonth,
            AverageRating = ratings.Count > 0 ? Math.Round(ratings.Average(), 1) : 0,
            TotalPagesRead = totalPagesRead,
            CurrentStreak = streak?.CurrentStreak ?? 0
        };
    }

    /// <inheritdoc />
    public async Task<IEnumerable<MonthlyCount>> GetBooksByMonthAsync(string userId, int year)
    {
        var allBooks = await _bookRepo.GetByUserIdAsync(userId, null, 0, int.MaxValue);
        var yearBooks = allBooks.Books
            .Where(b => b.AddedDate.Year == year && b.Status == BookStatus.Completed)
            .GroupBy(b => b.AddedDate.Month)
            .Select(g => new MonthlyCount { Month = g.Key, Count = g.Count() })
            .ToList();

        // Fill in missing months
        for (int m = 1; m <= 12; m++)
        {
            if (!yearBooks.Any(mc => mc.Month == m))
                yearBooks.Add(new MonthlyCount { Month = m, Count = 0 });
        }

        return yearBooks.OrderBy(mc => mc.Month);
    }

    /// <inheritdoc />
    public async Task<IEnumerable<GenreCount>> GetGenreDistributionAsync(string userId)
    {
        var allBooks = await _bookRepo.GetByUserIdAsync(userId, null, 0, int.MaxValue);
        return allBooks.Books
            .Where(b => !string.IsNullOrEmpty(b.Genres))
            .SelectMany(b => b.Genres!.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
            .GroupBy(g => g)
            .Select(g => new GenreCount { Genre = g.Key, Count = g.Count() })
            .OrderByDescending(g => g.Count);
    }

    /// <inheritdoc />
    public async Task<IEnumerable<AuthorCount>> GetMostReadAuthorsAsync(string userId)
    {
        var allBooks = await _bookRepo.GetByUserIdAsync(userId, null, 0, int.MaxValue);
        return allBooks.Books
            .GroupBy(b => b.Author)
            .Select(g => new AuthorCount { Author = g.Key, Count = g.Count() })
            .OrderByDescending(a => a.Count)
            .Take(10);
    }
}
