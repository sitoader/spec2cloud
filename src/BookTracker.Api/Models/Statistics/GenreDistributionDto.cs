namespace BookTracker.Api.Models.Statistics;

/// <summary>
/// Data transfer object representing genre distribution.
/// </summary>
public class GenreDistributionDto
{
    public string Genre { get; set; } = default!;
    public int Count { get; set; }
}
