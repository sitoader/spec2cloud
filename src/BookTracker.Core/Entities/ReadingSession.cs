namespace BookTracker.Core.Entities;

/// <summary>
/// Represents a single reading session for a book.
/// </summary>
public class ReadingSession
{
    public Guid Id { get; set; }
    public required string UserId { get; set; }
    public Guid BookId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public int? PagesRead { get; set; }
    public int? CurrentPage { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public ApplicationUser? User { get; set; }
    public Book? Book { get; set; }
}
