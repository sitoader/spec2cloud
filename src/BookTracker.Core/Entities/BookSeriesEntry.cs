namespace BookTracker.Core.Entities;

/// <summary>
/// Records the position of a book within a series.
/// </summary>
public class BookSeriesEntry
{
    public Guid Id { get; set; }
    public Guid SeriesId { get; set; }
    public Guid BookId { get; set; }
    public int OrderIndex { get; set; }

    // Navigation properties
    public BookSeries? ParentSeries { get; set; }
    public Book? LinkedBook { get; set; }
}
