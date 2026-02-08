namespace BookTracker.Core.Entities;

/// <summary>
/// Captures a user's reading activity block for a specific book.
/// </summary>
public class ReadingSession
{
    public Guid Id { get; set; }
    public required string UserId { get; set; }
    public Guid BookId { get; set; }
    public DateTime SessionStart { get; set; }
    public DateTime? SessionEnd { get; set; }
    public int? PageCount { get; set; }
    public int? PageReached { get; set; }
    public string? SessionNotes { get; set; }
    public DateTime RecordedAt { get; set; }

    // Navigation properties
    public ApplicationUser? Owner { get; set; }
    public Book? TrackedBook { get; set; }
}
