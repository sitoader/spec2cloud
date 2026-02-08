namespace BookTracker.Core.Entities;

/// <summary>
/// Represents a user-curated list of books.
/// </summary>
public class Collection
{
    public Guid Id { get; set; }
    public required string UserId { get; set; }
    public required string Label { get; set; }
    public string? Summary { get; set; }
    public bool IsVisible { get; set; }
    public DateTime SetAt { get; set; }
    public DateTime ModifiedAt { get; set; }

    // Navigation properties
    public ApplicationUser? Owner { get; set; }
    public ICollection<CollectionBook> Items { get; set; } = new List<CollectionBook>();
}
