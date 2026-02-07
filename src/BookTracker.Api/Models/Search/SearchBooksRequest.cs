using System.ComponentModel.DataAnnotations;

namespace BookTracker.Api.Models.Search;

/// <summary>
/// Request model for searching external book databases.
/// </summary>
public record SearchBooksRequest
{
    /// <summary>Gets the search query string (minimum 3 characters).</summary>
    [Required, MinLength(3)]
    public required string Query { get; init; }

    /// <summary>Gets the maximum number of results to return.</summary>
    public int MaxResults { get; init; } = 20;
}
