using BookTracker.Api.Models.Series;
using BookTracker.Core.Exceptions;
using BookTracker.Core.Models;
using BookTracker.Core.Services;

namespace BookTracker.Api.Endpoints;

/// <summary>
/// Maps book series endpoints.
/// </summary>
public static class SeriesEndpoints
{
    public static void MapSeriesEndpoints(this IEndpointRouteBuilder app)
    {
        var series = app.MapGroup("/api/series")
            .WithTags("Series")
            .RequireAuthorization();

        series.MapGet("/", GetAllSeriesHandler)
            .WithName("GetAllSeries")
            .WithOpenApi();

        series.MapGet("/{id:guid}", GetSeriesHandler)
            .WithName("GetSeries")
            .WithOpenApi();

        series.MapGet("/book/{bookId:guid}", GetSeriesByBookHandler)
            .WithName("GetSeriesByBook")
            .WithOpenApi();

        series.MapPost("/", CreateSeriesHandler)
            .WithName("CreateSeries")
            .WithOpenApi();
    }

    private static async Task<IResult> GetAllSeriesHandler(ISeriesService svc)
    {
        var allSeries = await svc.GetAllSeriesAsync();
        return Results.Ok(allSeries.Select(ToDto));
    }

    private static async Task<IResult> GetSeriesHandler(
        Guid id,
        ISeriesService svc,
        HttpContext httpCtx)
    {
        try
        {
            var s = await svc.GetSeriesAsync(id);
            return Results.Ok(ToDto(s));
        }
        catch (SeriesNotFoundException)
        {
            return Results.NotFound(new ErrorResponse { Message = "Series not found.", TraceId = httpCtx.TraceIdentifier });
        }
    }

    private static async Task<IResult> GetSeriesByBookHandler(
        Guid bookId,
        ISeriesService svc)
    {
        var s = await svc.GetSeriesByBookAsync(bookId);
        if (s is null) return Results.NotFound();
        return Results.Ok(ToDto(s));
    }

    private static async Task<IResult> CreateSeriesHandler(
        CreateSeriesRequest payload,
        ISeriesService svc)
    {
        var books = payload.Books.Select(b => (b.BookId, b.Position));
        var s = await svc.CreateSeriesAsync(payload.Name, payload.Description, payload.TotalBooks, books);
        return Results.Created($"/api/series/{s.Id}", ToDto(s));
    }

    private static BookSeriesDto ToDto(Core.Entities.BookSeries s)
    {
        return new BookSeriesDto
        {
            Id = s.Id,
            Name = s.Name,
            TotalBooks = s.TotalBooks,
            Description = s.Description,
            Entries = s.Entries?.Select(e => new BookSeriesEntryDto
            {
                Id = e.Id,
                BookId = e.BookId,
                PositionInSeries = e.PositionInSeries
            }).ToList() ?? new List<BookSeriesEntryDto>(),
            CreatedAt = s.CreatedAt
        };
    }
}
