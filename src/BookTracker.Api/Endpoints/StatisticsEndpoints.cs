using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using BookTracker.Api.Models.Statistics;
using BookTracker.Core.Models;
using BookTracker.Core.Services;

namespace BookTracker.Api.Endpoints;

/// <summary>
/// Maps the /api/statistics route group for reading analytics.
/// </summary>
public static class StatisticsEndpoints
{
    /// <summary>
    /// Wires up statistics routes on the supplied <paramref name="app"/>.
    /// </summary>
    public static void MapStatisticsEndpoints(this IEndpointRouteBuilder app)
    {
        var stats = app.MapGroup("/api/statistics")
            .WithTags("Statistics")
            .RequireAuthorization();

        stats.MapGet("/overview", GetOverviewHandler)
            .WithName("GetStatisticsOverview")
            .WithOpenApi()
            .Produces<StatisticsOverviewDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized);

        stats.MapGet("/reading-by-month", GetReadingByMonthHandler)
            .WithName("GetReadingByMonth")
            .WithOpenApi()
            .Produces<MonthlyReadingDto[]>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized);

        stats.MapGet("/genre-distribution", GetGenreDistributionHandler)
            .WithName("GetGenreDistribution")
            .WithOpenApi()
            .Produces<GenreDistributionDto[]>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized);

        stats.MapGet("/authors-most-read", GetAuthorsMostReadHandler)
            .WithName("GetAuthorsMostRead")
            .WithOpenApi()
            .Produces<AuthorCountDto[]>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized);
    }

    // ── Handlers ────────────────────────────────────────────────

    private static async Task<IResult> GetOverviewHandler(
        IStatisticsService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        var overview = await svc.ComputeOverviewAsync(userId);
        return Results.Ok(new StatisticsOverviewDto
        {
            TotalBooks = overview.TotalBooksOwned,
            BooksThisYear = overview.CompletedThisYear,
            BooksThisMonth = overview.CompletedThisMonth,
            AverageRating = overview.MeanRating,
            TotalPagesRead = overview.CumulativePagesRead,
            CurrentStreak = overview.ActiveStreakDays,
        });
    }

    private static async Task<IResult> GetReadingByMonthHandler(
        IStatisticsService svc,
        HttpContext httpCtx,
        int? year = null)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        var targetYear = year ?? DateTime.UtcNow.Year;
        var monthly = await svc.ComputeMonthlyBreakdownAsync(userId, targetYear);
        var dtos = monthly.Select(m => new MonthlyReadingDto
        {
            Month = m.MonthNumber,
            Count = m.BookCount,
        }).ToArray();

        return Results.Ok(dtos);
    }

    private static async Task<IResult> GetGenreDistributionHandler(
        IStatisticsService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        var genres = await svc.ComputeGenreSpreadAsync(userId);
        var dtos = genres.Select(g => new GenreDistributionDto
        {
            Genre = g.GenreName,
            Count = g.BookCount,
        }).ToArray();

        return Results.Ok(dtos);
    }

    private static async Task<IResult> GetAuthorsMostReadHandler(
        IStatisticsService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        var authors = await svc.ComputeTopAuthorsAsync(userId);
        var dtos = authors.Select(a => new AuthorCountDto
        {
            Author = a.AuthorName,
            Count = a.BookCount,
        }).ToArray();

        return Results.Ok(dtos);
    }

    // ── Helpers ─────────────────────────────────────────────────

    private static string? GetUserId(HttpContext httpCtx)
    {
        return httpCtx.User.FindFirstValue(JwtRegisteredClaimNames.Sub)
               ?? httpCtx.User.FindFirstValue(ClaimTypes.NameIdentifier);
    }
}
