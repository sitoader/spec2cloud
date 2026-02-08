namespace BookTracker.Api.Models.Statistics;

/// <summary>
/// Data transfer object representing author book count.
/// </summary>
public class AuthorCountDto
{
    public string Author { get; set; } = default!;
    public int Count { get; set; }
}
