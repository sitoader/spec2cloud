using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using BookTracker.Api.Models.Series;
using BookTracker.Core.Models;
using BookTracker.Core.Services;

namespace BookTracker.Api.Endpoints;

/// <summary>
/// Maps the /api/series route group for managing book series.
/// </summary>
public static class SeriesEndpoints
{
    /// <summary>
    /// Wires up series routes on the supplied <paramref name="app"/>.
    /// </summary>
    public static void MapSeriesEndpoints(this IEndpointRouteBuilder app)
    {
        var series = app.MapGroup("/api/series")
            .WithTags("Series")
            .RequireAuthorization();

        series.MapGet("/", ListAllSeriesHandler)
            .WithName("ListAllSeries")
            .WithOpenApi()
            .Produces<BookSeriesDto[]>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized);

        series.MapGet("/{id:guid}", GetSeriesHandler)
            .WithName("GetSeries")
            .WithOpenApi()
            .Produces<BookSeriesDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status404NotFound);

        series.MapGet("/book/{bookId:guid}", GetSeriesByBookHandler)
            .WithName("GetSeriesByBook")
            .WithOpenApi()
            .Produces<BookSeriesDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status404NotFound);

        series.MapPost("/", CreateSeriesHandler)
            .WithName("CreateSeries")
            .WithOpenApi()
            .Produces<BookSeriesDto>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status401Unauthorized);
    }

    // ── Handlers ────────────────────────────────────────────────

    private static async Task<IResult> ListAllSeriesHandler(
        ISeriesService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        var allSeries = await svc.ListAllSeriesAsync();
        var dtos = allSeries.Select(ToDto).ToArray();
        return Results.Ok(dtos);
    }

    private static async Task<IResult> GetSeriesHandler(
        Guid id,
        ISeriesService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        var series = await svc.FetchSeriesAsync(id);
        if (series is null)
        {
            return Results.NotFound(new ErrorResponse
            {
                Message = "Series not found.",
                TraceId = httpCtx.TraceIdentifier,
            });
        }

        return Results.Ok(ToDto(series));
    }

    private static async Task<IResult> GetSeriesByBookHandler(
        Guid bookId,
        ISeriesService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        var series = await svc.FetchSeriesByBookAsync(bookId);
        if (series is null)
        {
            return Results.NotFound(new ErrorResponse
            {
                Message = "No series found for this book.",
                TraceId = httpCtx.TraceIdentifier,
            });
        }

        return Results.Ok(ToDto(series));
    }

    private static async Task<IResult> CreateSeriesHandler(
        CreateSeriesRequest payload,
        ISeriesService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        try
        {
            var members = payload.Books
                .Select(b => (b.BookId, b.Position))
                .ToArray();

            var series = await svc.RegisterSeriesAsync(payload.Name, members);
            var dto = ToDto(series);
            return Results.Created($"/api/series/{dto.Id}", dto);
        }
        catch (Exception ex)
        {
            return Results.Json(
                new ErrorResponse
                {
                    Message = $"Failed to create series: {ex.Message}",
                    TraceId = httpCtx.TraceIdentifier,
                },
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    // ── Helpers ─────────────────────────────────────────────────

    private static string? GetUserId(HttpContext httpCtx)
    {
        return httpCtx.User.FindFirstValue(JwtRegisteredClaimNames.Sub)
               ?? httpCtx.User.FindFirstValue(ClaimTypes.NameIdentifier);
    }

    private static BookSeriesDto ToDto(Core.Entities.BookSeries series)
    {
        return new BookSeriesDto
        {
            Id = series.Id,
            Name = series.SeriesTitle,
            TotalBooks = series.ExpectedBookCount,
            Description = series.Synopsis,
            Entries = series.Members.Select(ToEntryDto).ToArray(),
        };
    }

    private static BookSeriesEntryDto ToEntryDto(Core.Entities.BookSeriesEntry entry)
    {
        return new BookSeriesEntryDto
        {
            Id = entry.Id,
            BookId = entry.BookId,
            PositionInSeries = entry.OrderIndex,
        };
    }
}
