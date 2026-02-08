using System.ComponentModel.DataAnnotations;

namespace BookTracker.Api.Models.Series;

/// <summary>Request model for creating a series.</summary>
public record CreateSeriesRequest
{
    [Required, MaxLength(200)] public string Name { get; init; } = string.Empty;
    [MaxLength(2000)] public string? Description { get; init; }
    public int? TotalBooks { get; init; }
    public List<SeriesBookEntry> Books { get; init; } = new();
}

/// <summary>A book entry within a series.</summary>
public record SeriesBookEntry
{
    [Required] public Guid BookId { get; init; }
    [Required] public int Position { get; init; }
}

/// <summary>DTO for a book series.</summary>
public record BookSeriesDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public int? TotalBooks { get; init; }
    public string? Description { get; init; }
    public List<BookSeriesEntryDto> Entries { get; init; } = new();
    public DateTime CreatedAt { get; init; }
}

/// <summary>DTO for a series entry.</summary>
public record BookSeriesEntryDto
{
    public Guid Id { get; init; }
    public Guid BookId { get; init; }
    public int PositionInSeries { get; init; }
}
