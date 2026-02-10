using BookTracker.Core.Entities;

namespace BookTracker.Api.Models.Collections;

/// <summary>
/// Data transfer object for a collection with its books.
/// </summary>
public class CollectionDetailDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public bool IsPublic { get; set; }
    public int BookCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public CollectionBookItemDto[] Books { get; set; } = [];
}

/// <summary>
/// A book entry within a collection.
/// </summary>
public class CollectionBookItemDto
{
    public Guid BookId { get; set; }
    public string Title { get; set; } = default!;
    public string Author { get; set; } = default!;
    public string? CoverImageUrl { get; set; }
    public BookStatus Status { get; set; }
    public string? Notes { get; set; }
    public DateTime AddedAt { get; set; }
}
