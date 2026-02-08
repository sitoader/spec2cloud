using System.ComponentModel.DataAnnotations;

namespace BookTracker.Api.Models.Collections;

/// <summary>
/// Request model for updating a book collection.
/// </summary>
public record UpdateCollectionRequest
{
    /// <summary>Gets the collection name.</summary>
    [Required, MaxLength(200)]
    public string Name { get; init; } = default!;

    /// <summary>Gets the optional description.</summary>
    public string? Description { get; init; }

    /// <summary>Gets whether the collection is public.</summary>
    public bool IsPublic { get; init; }
}
