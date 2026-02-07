namespace BookTracker.Api.Models.Books;

/// <summary>
/// Data transfer object representing a book rating.
/// </summary>
public record RatingDto
{
    /// <summary>Gets the rating identifier.</summary>
    public required Guid Id { get; init; }

    /// <summary>Gets the score (1-5).</summary>
    public required int Score { get; init; }

    /// <summary>Gets optional review notes.</summary>
    public string? Notes { get; init; }

    /// <summary>Gets the date when the rating was created.</summary>
    public required DateTime RatedDate { get; init; }

    /// <summary>Gets the date when the rating was last updated.</summary>
    public DateTime? UpdatedDate { get; init; }
}
