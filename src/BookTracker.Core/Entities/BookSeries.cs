namespace BookTracker.Core.Entities;

/// <summary>
/// Represents a book series.
/// </summary>
public class BookSeries
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public int? TotalBooks { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation property
    public ICollection<BookSeriesEntry> Entries { get; set; } = new List<BookSeriesEntry>();
}
