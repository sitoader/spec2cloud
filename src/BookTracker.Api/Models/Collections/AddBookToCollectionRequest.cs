using System.ComponentModel.DataAnnotations;

namespace BookTracker.Api.Models.Collections;

/// <summary>
/// Request model for adding a book to a collection.
/// </summary>
public record AddBookToCollectionRequest
{
    /// <summary>Gets the book identifier.</summary>
    [Required]
    public Guid BookId { get; init; }

    /// <summary>Gets optional notes about the book in this collection.</summary>
    public string? Notes { get; init; }
}
