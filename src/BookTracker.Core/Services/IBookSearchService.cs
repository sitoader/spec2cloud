namespace BookTracker.Core.Services;

/// <summary>
/// Contract for searching external book databases.
/// </summary>
public interface IBookSearchService
{
    /// <summary>
    /// Searches external APIs for books matching the query.
    /// Falls back to secondary API if the primary fails.
    /// Returns an empty list if all APIs fail (does not throw).
    /// </summary>
    Task<List<BookSearchResult>> SearchBooksAsync(string query, int maxResults = 20);
}

/// <summary>
/// Represents a single book result from an external search API.
/// </summary>
public record BookSearchResult
{
    public string? ExternalId { get; init; }
    public required string Title { get; init; }
    public required string Author { get; init; }
    public string? Isbn { get; init; }
    public string? CoverImageUrl { get; init; }
    public string? Description { get; set; }
    public string[]? Genres { get; init; }
    public int? PublicationYear { get; init; }
    public required string Source { get; init; }
}
