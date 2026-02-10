using System.ComponentModel.DataAnnotations;
using BookTracker.Core.Entities;

namespace BookTracker.Api.Models.Books;

/// <summary>
/// Request model for updating an existing book. All fields are optional (partial update).
/// </summary>
public record UpdateBookRequest
{
    /// <summary>Gets the updated title.</summary>
    [MaxLength(500)]
    public string? Title { get; init; }

    /// <summary>Gets the updated author.</summary>
    [MaxLength(200)]
    public string? Author { get; init; }

    /// <summary>Gets the updated reading status.</summary>
    public BookStatus? Status { get; init; }

    /// <summary>Gets the updated ISBN.</summary>
    [MaxLength(20)]
    public string? Isbn { get; init; }

    /// <summary>Gets the updated cover image URL.</summary>
    [MaxLength(500)]
    public string? CoverImageUrl { get; init; }

    /// <summary>Gets the updated description.</summary>
    [MaxLength(2000)]
    public string? Description { get; init; }

    /// <summary>Gets the updated genre tags.</summary>
    public string[]? Genres { get; init; }

    /// <summary>Gets the updated publication date.</summary>
    public DateTime? PublicationDate { get; init; }

    /// <summary>Gets the updated page count.</summary>
    public int? PageCount { get; init; }

    /// <summary>Gets the updated source.</summary>
    public string? Source { get; init; }
}
