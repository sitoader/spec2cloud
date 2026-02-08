namespace BookTracker.Api.Models.Statistics;

/// <summary>
/// Data transfer object representing monthly reading count.
/// </summary>
public class MonthlyReadingDto
{
    public int Month { get; set; }
    public int Count { get; set; }
}
