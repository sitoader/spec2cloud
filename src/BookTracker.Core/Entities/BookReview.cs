namespace BookTracker.Core.Entities;

/// <summary>
/// Represents an enhanced book review with rich text, tags, and mood.
/// </summary>
public class BookReview
{
    public Guid Id { get; set; }
    public required string UserId { get; set; }
    public Guid BookId { get; set; }
    public int Rating { get; set; }
    public string? ReviewText { get; set; }
    public string? ReviewHtml { get; set; }
    public bool IsPublic { get; set; }
    public string? Tags { get; set; }
    public string? Mood { get; set; }
    public bool? WouldRecommend { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public ApplicationUser? User { get; set; }
    public Book? Book { get; set; }
}
