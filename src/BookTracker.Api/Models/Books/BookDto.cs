using BookTracker.Core.Entities;

namespace BookTracker.Api.Models.Books;

/// <summary>
/// Data transfer object representing a book in the user's library.
/// </summary>
public record BookDto
{
    /// <summary>Gets the book identifier.</summary>
    public required Guid Id { get; init; }

    /// <summary>Gets the book title.</summary>
    public required string Title { get; init; }

    /// <summary>Gets the book author.</summary>
    public required string Author { get; init; }

    /// <summary>Gets the optional ISBN.</summary>
    public string? Isbn { get; init; }

    /// <summary>Gets the optional cover image URL.</summary>
    public string? CoverImageUrl { get; init; }

    /// <summary>Gets the optional description.</summary>
    public string? Description { get; init; }

    /// <summary>Gets the genre tags.</summary>
    public string[]? Genres { get; init; }

    /// <summary>Gets the optional publication date.</summary>
    public DateTime? PublicationDate { get; init; }

    /// <summary>Gets the reading status.</summary>
    public required BookStatus Status { get; init; }

    /// <summary>Gets the date when the book was added to the library.</summary>
    public required DateTime AddedDate { get; init; }

    /// <summary>Gets the optional source where the book was discovered.</summary>
    public string? Source { get; init; }

    /// <summary>Gets the optional rating data.</summary>
    public RatingDto? Rating { get; init; }
}
