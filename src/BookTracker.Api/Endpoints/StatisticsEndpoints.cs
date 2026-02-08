using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using BookTracker.Api.Models.Statistics;
using BookTracker.Core.Services;

namespace BookTracker.Api.Endpoints;

/// <summary>
/// Maps reading statistics endpoints.
/// </summary>
public static class StatisticsEndpoints
{
    public static void MapStatisticsEndpoints(this IEndpointRouteBuilder app)
    {
        var stats = app.MapGroup("/api/statistics")
            .WithTags("Statistics")
            .RequireAuthorization();

        stats.MapGet("/overview", GetOverviewHandler)
            .WithName("GetStatisticsOverview")
            .WithOpenApi();

        stats.MapGet("/reading-by-month", GetBooksByMonthHandler)
            .WithName("GetReadingByMonth")
            .WithOpenApi();

        stats.MapGet("/genre-distribution", GetGenreDistributionHandler)
            .WithName("GetGenreDistribution")
            .WithOpenApi();

        stats.MapGet("/authors-most-read", GetMostReadAuthorsHandler)
            .WithName("GetMostReadAuthors")
            .WithOpenApi();
    }

    private static async Task<IResult> GetOverviewHandler(
        IStatisticsService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        var overview = await svc.GetOverviewAsync(userId);
        return Results.Ok(new StatisticsOverviewDto
        {
            TotalBooks = overview.TotalBooks,
            BooksThisYear = overview.BooksThisYear,
            BooksThisMonth = overview.BooksThisMonth,
            AverageRating = overview.AverageRating,
            TotalPagesRead = overview.TotalPagesRead,
            CurrentStreak = overview.CurrentStreak
        });
    }

    private static async Task<IResult> GetBooksByMonthHandler(
        int? year,
        IStatisticsService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        var data = await svc.GetBooksByMonthAsync(userId, year ?? DateTime.UtcNow.Year);
        return Results.Ok(data.Select(m => new MonthlyCountDto { Month = m.Month, Count = m.Count }));
    }

    private static async Task<IResult> GetGenreDistributionHandler(
        IStatisticsService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        var data = await svc.GetGenreDistributionAsync(userId);
        return Results.Ok(data.Select(g => new GenreCountDto { Genre = g.Genre, Count = g.Count }));
    }

    private static async Task<IResult> GetMostReadAuthorsHandler(
        IStatisticsService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        var data = await svc.GetMostReadAuthorsAsync(userId);
        return Results.Ok(data.Select(a => new AuthorCountDto { Author = a.Author, Count = a.Count }));
    }

    private static string? GetUserId(HttpContext httpCtx)
    {
        return httpCtx.User.FindFirstValue(JwtRegisteredClaimNames.Sub)
               ?? httpCtx.User.FindFirstValue(ClaimTypes.NameIdentifier);
    }
}
