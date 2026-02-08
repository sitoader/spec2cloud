namespace BookTracker.Core.Entities;

/// <summary>
/// Represents a named sequence of related books.
/// </summary>
public class BookSeries
{
    public Guid Id { get; set; }
    public required string SeriesTitle { get; set; }
    public int? ExpectedBookCount { get; set; }
    public string? Synopsis { get; set; }
    public DateTime RegisteredAt { get; set; }

    // Navigation properties
    public ICollection<BookSeriesEntry> Members { get; set; } = new List<BookSeriesEntry>();
}
