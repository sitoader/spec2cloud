namespace BookTracker.Api.Models.Series;

/// <summary>
/// Data transfer object representing a book's position in a series.
/// </summary>
public class BookSeriesEntryDto
{
    public Guid Id { get; set; }
    public Guid BookId { get; set; }
    public int PositionInSeries { get; set; }
}
