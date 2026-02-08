using System.ComponentModel.DataAnnotations;

namespace BookTracker.Api.Models.Progress;

/// <summary>
/// Request model for logging a reading session.
/// </summary>
public record LogSessionRequest
{
    /// <summary>Gets the book identifier.</summary>
    [Required]
    public Guid BookId { get; init; }

    /// <summary>Gets the session start time.</summary>
    [Required]
    public DateTime StartTime { get; init; }

    /// <summary>Gets the optional session end time.</summary>
    public DateTime? EndTime { get; init; }

    /// <summary>Gets the optional number of pages read.</summary>
    public int? PagesRead { get; init; }

    /// <summary>Gets the optional current page reached.</summary>
    public int? CurrentPage { get; init; }

    /// <summary>Gets optional session notes.</summary>
    [MaxLength(1000)]
    public string? Notes { get; init; }
}
