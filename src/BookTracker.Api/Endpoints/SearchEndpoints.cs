using BookTracker.Api.Models.Search;
using BookTracker.Core.Services;

namespace BookTracker.Api.Endpoints;

/// <summary>
/// Maps the /api/search/* route group for searching external book databases.
/// </summary>
public static class SearchEndpoints
{
    /// <summary>
    /// Wires up book search routes on the supplied <paramref name="app"/>.
    /// </summary>
    public static void MapSearchEndpoints(this IEndpointRouteBuilder app)
    {
        var search = app.MapGroup("/api/search")
            .WithTags("Search")
            .RequireAuthorization();

        search.MapGet("/books", SearchBooksHandler)
            .WithName("SearchBooks")
            .WithOpenApi()
            .Produces<ExternalBookDto[]>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status503ServiceUnavailable);
    }

    // ── Handlers ────────────────────────────────────────────────

    private static async Task<IResult> SearchBooksHandler(
        IBookSearchService searchService,
        string? query,
        int maxResults = 20)
    {
        if (string.IsNullOrWhiteSpace(query) || query.Trim().Length < 3)
        {
            return Results.BadRequest(new { message = "Query must be at least 3 characters long." });
        }

        if (maxResults < 1) maxResults = 1;
        if (maxResults > 20) maxResults = 20;

        var results = await searchService.SearchBooksAsync(query.Trim(), maxResults);

        var dtos = results.Select(r => new ExternalBookDto
        {
            ExternalId = r.ExternalId,
            Title = r.Title,
            Author = r.Author,
            Isbn = r.Isbn,
            CoverImageUrl = r.CoverImageUrl,
            Description = r.Description,
            Genres = r.Genres,
            PublicationYear = r.PublicationYear,
            Source = r.Source,
        }).ToArray();

        return Results.Ok(dtos);
    }
}
