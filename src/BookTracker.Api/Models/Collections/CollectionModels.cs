using System.ComponentModel.DataAnnotations;

namespace BookTracker.Api.Models.Collections;

/// <summary>Request model for creating a collection.</summary>
public record CreateCollectionRequest
{
    [Required, MaxLength(200)] public string Name { get; init; } = string.Empty;
    [MaxLength(2000)] public string? Description { get; init; }
    public bool IsPublic { get; init; }
}

/// <summary>Request model for updating a collection.</summary>
public record UpdateCollectionRequest
{
    [MaxLength(200)] public string? Name { get; init; }
    [MaxLength(2000)] public string? Description { get; init; }
    public bool? IsPublic { get; init; }
}

/// <summary>Request model for adding a book to a collection.</summary>
public record AddBookToCollectionRequest
{
    [Required] public Guid BookId { get; init; }
    [MaxLength(2000)] public string? Notes { get; init; }
}

/// <summary>DTO for a collection.</summary>
public record CollectionDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public bool IsPublic { get; init; }
    public int BookCount { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

/// <summary>DTO for a collection book entry.</summary>
public record CollectionBookDto
{
    public Guid Id { get; init; }
    public Guid BookId { get; init; }
    public DateTime AddedAt { get; init; }
    public string? Notes { get; init; }
}
