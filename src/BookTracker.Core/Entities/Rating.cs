namespace BookTracker.Core.Entities;

/// <summary>
/// Represents a user's rating for a book.
/// </summary>
public class Rating
{
    public Guid Id { get; set; }
    public Guid BookId { get; set; }
    public int Score { get; set; }
    public string? Notes { get; set; }
    public DateTime RatedDate { get; set; }
    public DateTime? UpdatedDate { get; set; }
    
    // Navigation property
    public Book Book { get; set; } = null!;
}
