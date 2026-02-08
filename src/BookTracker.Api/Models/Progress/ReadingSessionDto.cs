namespace BookTracker.Api.Models.Progress;

/// <summary>
/// Data transfer object representing a reading session.
/// </summary>
public class ReadingSessionDto
{
    public Guid Id { get; set; }
    public Guid BookId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public int? PagesRead { get; set; }
    public int? CurrentPage { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}
