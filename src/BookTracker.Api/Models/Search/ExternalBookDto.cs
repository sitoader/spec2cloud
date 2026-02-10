namespace BookTracker.Api.Models.Search;

/// <summary>
/// DTO representing a book result from an external search API.
/// </summary>
public record ExternalBookDto
{
    /// <summary>Gets the external identifier from the source API.</summary>
    public string? ExternalId { get; init; }

    /// <summary>Gets the book title.</summary>
    public required string Title { get; init; }

    /// <summary>Gets the primary author.</summary>
    public required string Author { get; init; }

    /// <summary>Gets the ISBN.</summary>
    public string? Isbn { get; init; }

    /// <summary>Gets the cover image URL.</summary>
    public string? CoverImageUrl { get; init; }

    /// <summary>Gets the book description.</summary>
    public string? Description { get; init; }

    /// <summary>Gets the genre/category tags.</summary>
    public string[]? Genres { get; init; }

    /// <summary>Gets the publication year.</summary>
    public int? PublicationYear { get; init; }

    /// <summary>Gets the number of pages.</summary>
    public int? PageCount { get; init; }

    /// <summary>Gets the source API identifier ("google-books" or "open-library").</summary>
    public required string Source { get; init; }
}
