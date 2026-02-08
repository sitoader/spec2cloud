using System.ComponentModel.DataAnnotations;

namespace BookTracker.Api.Models.Progress;

/// <summary>
/// Request model for updating reading progress.
/// </summary>
public record UpdateProgressRequest
{
    /// <summary>Gets the current page number.</summary>
    [Required, Range(0, int.MaxValue)]
    public int CurrentPage { get; init; }

    /// <summary>Gets the optional total pages in the book.</summary>
    public int? TotalPages { get; init; }
}
