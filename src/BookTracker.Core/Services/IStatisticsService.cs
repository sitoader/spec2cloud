namespace BookTracker.Core.Services;

/// <summary>
/// Contract for reading statistics and analytics operations.
/// </summary>
public interface IStatisticsService
{
    /// <summary>Computes an overview of the owner's reading statistics.</summary>
    Task<ReadingStatsOverview> ComputeOverviewAsync(string ownerId);

    /// <summary>Computes a monthly breakdown of books read for a given year.</summary>
    Task<IEnumerable<MonthlyBookTally>> ComputeMonthlyBreakdownAsync(string ownerId, int year);

    /// <summary>Computes the genre distribution for the owner's library.</summary>
    Task<IEnumerable<GenreTally>> ComputeGenreSpreadAsync(string ownerId);

    /// <summary>Computes the top authors by book count for the owner.</summary>
    Task<IEnumerable<AuthorTally>> ComputeTopAuthorsAsync(string ownerId);
}

/// <summary>
/// Aggregated reading statistics overview.
/// </summary>
public class ReadingStatsOverview
{
    public int TotalBooksOwned { get; set; }
    public int CompletedThisYear { get; set; }
    public int CompletedThisMonth { get; set; }
    public decimal MeanRating { get; set; }
    public int CumulativePagesRead { get; set; }
    public int ActiveStreakDays { get; set; }
}

/// <summary>
/// Books completed in a specific month.
/// </summary>
public class MonthlyBookTally
{
    public int MonthNumber { get; set; }
    public int BookCount { get; set; }
}

/// <summary>
/// Book count by genre.
/// </summary>
public class GenreTally
{
    public required string GenreName { get; set; }
    public int BookCount { get; set; }
}

/// <summary>
/// Book count by author.
/// </summary>
public class AuthorTally
{
    public required string AuthorName { get; set; }
    public int BookCount { get; set; }
}
