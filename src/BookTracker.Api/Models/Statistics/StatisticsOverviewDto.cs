namespace BookTracker.Api.Models.Statistics;

/// <summary>
/// Data transfer object representing a reading statistics overview.
/// </summary>
public class StatisticsOverviewDto
{
    public int TotalBooks { get; set; }
    public int BooksThisYear { get; set; }
    public int BooksThisMonth { get; set; }
    public decimal AverageRating { get; set; }
    public int TotalPagesRead { get; set; }
    public int CurrentStreak { get; set; }
}
