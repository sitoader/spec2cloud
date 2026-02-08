namespace BookTracker.Core.Entities;

/// <summary>
/// Tracks reading progress for a specific book.
/// </summary>
public class ReadingProgress
{
    public Guid Id { get; set; }
    public required string UserId { get; set; }
    public Guid BookId { get; set; }
    public int? TotalPages { get; set; }
    public int CurrentPage { get; set; }
    public decimal ProgressPercentage { get; set; }
    public DateTime? EstimatedCompletionDate { get; set; }
    public DateTime LastUpdated { get; set; }

    // Navigation properties
    public ApplicationUser? User { get; set; }
    public Book? Book { get; set; }
}
