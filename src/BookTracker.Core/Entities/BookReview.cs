namespace BookTracker.Core.Entities;

/// <summary>
/// Represents a rich user review of a book, including tags and reading mood.
/// </summary>
public class BookReview
{
    public Guid Id { get; set; }
    public required string UserId { get; set; }
    public Guid BookId { get; set; }
    public int Stars { get; set; }
    public string? PlainTextBody { get; set; }
    public string? FormattedBody { get; set; }
    public bool IsVisible { get; set; } = true;
    public string? TagsJson { get; set; }
    public string? ReadingMood { get; set; }
    public bool? Recommended { get; set; }
    public DateTime WrittenAt { get; set; }
    public DateTime ModifiedAt { get; set; }

    // Navigation properties
    public ApplicationUser? Reviewer { get; set; }
    public Book? ReviewedBook { get; set; }
}
