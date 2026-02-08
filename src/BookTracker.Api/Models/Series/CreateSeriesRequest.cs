using System.ComponentModel.DataAnnotations;

namespace BookTracker.Api.Models.Series;

/// <summary>
/// Request model for creating a book series.
/// </summary>
public record CreateSeriesRequest
{
    /// <summary>Gets the series name.</summary>
    [Required, MaxLength(200)]
    public string Name { get; init; } = default!;

    /// <summary>Gets the books in the series.</summary>
    [Required]
    public SeriesBookEntry[] Books { get; init; } = Array.Empty<SeriesBookEntry>();
}

/// <summary>
/// Represents a book entry within a series creation request.
/// </summary>
public record SeriesBookEntry
{
    /// <summary>Gets the book identifier.</summary>
    public Guid BookId { get; init; }

    /// <summary>Gets the position in the series.</summary>
    public int Position { get; init; }
}
