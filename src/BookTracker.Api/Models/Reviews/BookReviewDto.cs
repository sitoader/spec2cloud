namespace BookTracker.Api.Models.Reviews;

/// <summary>
/// Data transfer object representing a book review.
/// </summary>
public class BookReviewDto
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = default!;
    public string? ReviewerDisplayName { get; set; }
    public Guid BookId { get; set; }
    public int Rating { get; set; }
    public string? ReviewText { get; set; }
    public string? ReviewHtml { get; set; }
    public bool IsPublic { get; set; }
    public string[]? Tags { get; set; }
    public string? Mood { get; set; }
    public bool? WouldRecommend { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
