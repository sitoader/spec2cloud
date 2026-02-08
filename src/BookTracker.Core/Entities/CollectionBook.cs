namespace BookTracker.Core.Entities;

/// <summary>
/// Associates a book with a collection.
/// </summary>
public class CollectionBook
{
    public Guid Id { get; set; }
    public Guid CollectionId { get; set; }
    public Guid BookId { get; set; }
    public DateTime AddedAt { get; set; }
    public string? Notes { get; set; }

    // Navigation properties
    public Collection? Collection { get; set; }
    public Book? Book { get; set; }
}
