namespace BookTracker.Core.Entities;

/// <summary>
/// Associates a book with its position in a series.
/// </summary>
public class BookSeriesEntry
{
    public Guid Id { get; set; }
    public Guid SeriesId { get; set; }
    public Guid BookId { get; set; }
    public int PositionInSeries { get; set; }

    // Navigation properties
    public BookSeries? Series { get; set; }
    public Book? Book { get; set; }
}
