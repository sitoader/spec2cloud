namespace BookTracker.Api.Models.Progress;

/// <summary>
/// Data transfer object representing reading progress for a book.
/// </summary>
public class ReadingProgressDto
{
    public Guid Id { get; set; }
    public Guid BookId { get; set; }
    public int? TotalPages { get; set; }
    public int CurrentPage { get; set; }
    public decimal ProgressPercentage { get; set; }
    public DateTime? EstimatedCompletionDate { get; set; }
    public DateTime LastUpdated { get; set; }
}
