namespace BookTracker.Core.Services;

/// <summary>
/// Contract for reading statistics operations.
/// </summary>
public interface IStatisticsService
{
    /// <summary>Gets an overview of reading statistics for a user.</summary>
    Task<StatisticsOverview> GetOverviewAsync(string userId);

    /// <summary>Gets books read per month for a given year.</summary>
    Task<IEnumerable<MonthlyCount>> GetBooksByMonthAsync(string userId, int year);

    /// <summary>Gets genre distribution for a user.</summary>
    Task<IEnumerable<GenreCount>> GetGenreDistributionAsync(string userId);

    /// <summary>Gets most-read authors for a user.</summary>
    Task<IEnumerable<AuthorCount>> GetMostReadAuthorsAsync(string userId);
}

/// <summary>
/// Overview statistics for a user.
/// </summary>
public class StatisticsOverview
{
    public int TotalBooks { get; set; }
    public int BooksThisYear { get; set; }
    public int BooksThisMonth { get; set; }
    public double AverageRating { get; set; }
    public int TotalPagesRead { get; set; }
    public int CurrentStreak { get; set; }
}

/// <summary>
/// Books read count for a specific month.
/// </summary>
public class MonthlyCount
{
    public int Month { get; set; }
    public int Count { get; set; }
}

/// <summary>
/// Book count for a specific genre.
/// </summary>
public class GenreCount
{
    public required string Genre { get; set; }
    public int Count { get; set; }
}

/// <summary>
/// Book count for a specific author.
/// </summary>
public class AuthorCount
{
    public required string Author { get; set; }
    public int Count { get; set; }
}
