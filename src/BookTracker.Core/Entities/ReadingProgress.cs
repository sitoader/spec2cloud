namespace BookTracker.Core.Entities;

/// <summary>
/// Stores the cumulative reading position for a user-book pair.
/// </summary>
public class ReadingProgress
{
    public Guid Id { get; set; }
    public required string UserId { get; set; }
    public Guid BookId { get; set; }
    public int? BookTotalPages { get; set; }
    public int PageNumber { get; set; }
    public decimal CompletionPercent { get; set; }
    public DateTime? ProjectedFinishDate { get; set; }
    public DateTime ModifiedAt { get; set; }

    // Navigation properties
    public ApplicationUser? Owner { get; set; }
    public Book? TrackedBook { get; set; }
}
