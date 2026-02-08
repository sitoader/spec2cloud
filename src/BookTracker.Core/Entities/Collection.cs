namespace BookTracker.Core.Entities;

/// <summary>
/// Represents a user-created book collection.
/// </summary>
public class Collection
{
    public Guid Id { get; set; }
    public required string UserId { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public bool IsPublic { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public ApplicationUser? User { get; set; }
    public ICollection<CollectionBook> CollectionBooks { get; set; } = new List<CollectionBook>();
}
