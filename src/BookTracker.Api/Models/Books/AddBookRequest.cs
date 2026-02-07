using System.ComponentModel.DataAnnotations;
using BookTracker.Core.Entities;

namespace BookTracker.Api.Models.Books;

/// <summary>
/// Request model for adding a new book to the user's library.
/// </summary>
public record AddBookRequest
{
    /// <summary>Gets the book title.</summary>
    [Required, MaxLength(500)]
    public required string Title { get; init; }

    /// <summary>Gets the book author.</summary>
    [Required, MaxLength(200)]
    public required string Author { get; init; }

    /// <summary>Gets the optional ISBN.</summary>
    [MaxLength(20)]
    public string? Isbn { get; init; }

    /// <summary>Gets the optional cover image URL.</summary>
    [MaxLength(500)]
    public string? CoverImageUrl { get; init; }

    /// <summary>Gets the optional book description.</summary>
    [MaxLength(2000)]
    public string? Description { get; init; }

    /// <summary>Gets the optional genre tags.</summary>
    public string[]? Genres { get; init; }

    /// <summary>Gets the optional publication date.</summary>
    public DateTime? PublicationDate { get; init; }

    /// <summary>Gets the reading status.</summary>
    [Required]
    public BookStatus Status { get; init; }

    /// <summary>Gets the optional source where the book was discovered.</summary>
    public string? Source { get; init; }
}
