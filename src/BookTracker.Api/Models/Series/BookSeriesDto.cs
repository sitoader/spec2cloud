namespace BookTracker.Api.Models.Series;

/// <summary>
/// Data transfer object representing a book series.
/// </summary>
public class BookSeriesDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public int? TotalBooks { get; set; }
    public string? Description { get; set; }
    public BookSeriesEntryDto[]? Entries { get; set; }
}
