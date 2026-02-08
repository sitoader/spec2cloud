namespace BookTracker.Api.Models.Collections;

/// <summary>
/// Data transfer object representing a book collection.
/// </summary>
public class CollectionDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public bool IsPublic { get; set; }
    public int BookCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
