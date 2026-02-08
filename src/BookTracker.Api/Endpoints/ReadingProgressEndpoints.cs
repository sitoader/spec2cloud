using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using BookTracker.Api.Models.Progress;
using BookTracker.Core.Entities;
using BookTracker.Core.Models;
using BookTracker.Core.Services;

namespace BookTracker.Api.Endpoints;

/// <summary>
/// Maps the /api/reading-sessions, /api/reading-progress, and /api/reading-streak route groups.
/// </summary>
public static class ReadingProgressEndpoints
{
    /// <summary>
    /// Wires up reading progress routes on the supplied <paramref name="app"/>.
    /// </summary>
    public static void MapReadingProgressEndpoints(this IEndpointRouteBuilder app)
    {
        var sessions = app.MapGroup("/api/reading-sessions")
            .WithTags("ReadingProgress")
            .RequireAuthorization();

        sessions.MapPost("/", LogSessionHandler)
            .WithName("LogReadingSession")
            .WithOpenApi()
            .Produces<ReadingSessionDto>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status401Unauthorized);

        sessions.MapGet("/", ListSessionsHandler)
            .WithName("ListReadingSessions")
            .WithOpenApi()
            .Produces<ReadingSessionDto[]>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized);

        var progress = app.MapGroup("/api/reading-progress")
            .WithTags("ReadingProgress")
            .RequireAuthorization();

        progress.MapGet("/{bookId:guid}", GetProgressHandler)
            .WithName("GetReadingProgress")
            .WithOpenApi()
            .Produces<ReadingProgressDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status404NotFound);

        progress.MapPut("/{bookId:guid}", UpdateProgressHandler)
            .WithName("UpdateReadingProgress")
            .WithOpenApi()
            .Produces<ReadingProgressDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized);

        var streak = app.MapGroup("/api/reading-streak")
            .WithTags("ReadingProgress")
            .RequireAuthorization();

        streak.MapGet("/", GetStreakHandler)
            .WithName("GetReadingStreak")
            .WithOpenApi()
            .Produces<ReadingStreakDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized);
    }

    // ── Handlers ────────────────────────────────────────────────

    private static async Task<IResult> LogSessionHandler(
        LogSessionRequest payload,
        IReadingProgressService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        try
        {
            var session = await svc.RecordSessionAsync(
                userId,
                payload.BookId,
                payload.StartTime,
                payload.EndTime,
                payload.PagesRead,
                payload.CurrentPage,
                payload.Notes);

            return Results.Created($"/api/reading-sessions/{session.Id}", ToSessionDto(session));
        }
        catch (Exception ex)
        {
            return Results.Json(
                new ErrorResponse
                {
                    Message = $"Failed to log session: {ex.Message}",
                    TraceId = httpCtx.TraceIdentifier,
                },
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    private static async Task<IResult> ListSessionsHandler(
        IReadingProgressService svc,
        HttpContext httpCtx,
        Guid? bookId = null,
        DateTime? startDate = null,
        DateTime? endDate = null)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        var sessions = await svc.ListSessionsAsync(userId, bookId, startDate, endDate);
        var dtos = sessions.Select(ToSessionDto).ToArray();
        return Results.Ok(dtos);
    }

    private static async Task<IResult> GetProgressHandler(
        Guid bookId,
        IReadingProgressService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        var progress = await svc.FetchProgressAsync(userId, bookId);
        if (progress is null)
        {
            return Results.NotFound(new ErrorResponse
            {
                Message = "Reading progress not found.",
                TraceId = httpCtx.TraceIdentifier,
            });
        }

        return Results.Ok(ToProgressDto(progress));
    }

    private static async Task<IResult> UpdateProgressHandler(
        Guid bookId,
        UpdateProgressRequest payload,
        IReadingProgressService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        try
        {
            var progress = await svc.SaveProgressAsync(userId, bookId, payload.CurrentPage, payload.TotalPages);
            return Results.Ok(ToProgressDto(progress));
        }
        catch (Exception ex)
        {
            return Results.Json(
                new ErrorResponse
                {
                    Message = $"Failed to update progress: {ex.Message}",
                    TraceId = httpCtx.TraceIdentifier,
                },
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    private static async Task<IResult> GetStreakHandler(
        IReadingProgressService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        var streak = await svc.FetchStreakAsync(userId);
        return Results.Ok(ToStreakDto(streak));
    }

    // ── Helpers ─────────────────────────────────────────────────

    private static string? GetUserId(HttpContext httpCtx)
    {
        return httpCtx.User.FindFirstValue(JwtRegisteredClaimNames.Sub)
               ?? httpCtx.User.FindFirstValue(ClaimTypes.NameIdentifier);
    }

    private static ReadingSessionDto ToSessionDto(ReadingSession session)
    {
        return new ReadingSessionDto
        {
            Id = session.Id,
            BookId = session.BookId,
            StartTime = session.SessionStart,
            EndTime = session.SessionEnd,
            PagesRead = session.PageCount,
            CurrentPage = session.PageReached,
            Notes = session.SessionNotes,
            CreatedAt = session.RecordedAt,
        };
    }

    private static ReadingProgressDto ToProgressDto(ReadingProgress progress)
    {
        return new ReadingProgressDto
        {
            Id = progress.Id,
            BookId = progress.BookId,
            TotalPages = progress.BookTotalPages,
            CurrentPage = progress.PageNumber,
            ProgressPercentage = progress.CompletionPercent,
            EstimatedCompletionDate = progress.ProjectedFinishDate,
            LastUpdated = progress.ModifiedAt,
        };
    }

    private static ReadingStreakDto ToStreakDto(ReadingStreak streak)
    {
        return new ReadingStreakDto
        {
            CurrentStreak = streak.ActiveStreakDays,
            LongestStreak = streak.BestStreakDays,
            LastReadDate = streak.MostRecentReadDate,
        };
    }
}
