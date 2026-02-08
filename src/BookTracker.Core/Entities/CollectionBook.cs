namespace BookTracker.Core.Entities;

/// <summary>
/// Associates a book with a user-curated collection.
/// </summary>
public class CollectionBook
{
    public Guid Id { get; set; }
    public Guid CollectionId { get; set; }
    public Guid BookId { get; set; }
    public DateTime IncludedAt { get; set; }
    public string? Annotation { get; set; }

    // Navigation properties
    public Collection? ParentCollection { get; set; }
    public Book? LinkedBook { get; set; }
}
