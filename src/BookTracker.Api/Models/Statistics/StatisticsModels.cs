namespace BookTracker.Api.Models.Statistics;

/// <summary>DTO for statistics overview.</summary>
public record StatisticsOverviewDto
{
    public int TotalBooks { get; init; }
    public int BooksThisYear { get; init; }
    public int BooksThisMonth { get; init; }
    public double AverageRating { get; init; }
    public int TotalPagesRead { get; init; }
    public int CurrentStreak { get; init; }
}

/// <summary>DTO for monthly book count.</summary>
public record MonthlyCountDto
{
    public int Month { get; init; }
    public int Count { get; init; }
}

/// <summary>DTO for genre distribution.</summary>
public record GenreCountDto
{
    public string Genre { get; init; } = string.Empty;
    public int Count { get; init; }
}

/// <summary>DTO for author count.</summary>
public record AuthorCountDto
{
    public string Author { get; init; } = string.Empty;
    public int Count { get; init; }
}
