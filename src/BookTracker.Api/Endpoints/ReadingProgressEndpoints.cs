using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using BookTracker.Api.Models.ReadingProgress;
using BookTracker.Core.Exceptions;
using BookTracker.Core.Models;
using BookTracker.Core.Services;

namespace BookTracker.Api.Endpoints;

/// <summary>
/// Maps reading progress, sessions, and streak endpoints.
/// </summary>
public static class ReadingProgressEndpoints
{
    public static void MapReadingProgressEndpoints(this IEndpointRouteBuilder app)
    {
        var sessions = app.MapGroup("/api/reading-sessions")
            .WithTags("Reading Progress")
            .RequireAuthorization();

        sessions.MapPost("/", LogSessionHandler)
            .WithName("LogReadingSession")
            .WithOpenApi();

        sessions.MapGet("/", GetSessionsHandler)
            .WithName("GetReadingSessions")
            .WithOpenApi();

        var progress = app.MapGroup("/api/reading-progress")
            .WithTags("Reading Progress")
            .RequireAuthorization();

        progress.MapGet("/{bookId:guid}", GetProgressHandler)
            .WithName("GetReadingProgress")
            .WithOpenApi();

        progress.MapPut("/{bookId:guid}", UpdateProgressHandler)
            .WithName("UpdateReadingProgress")
            .WithOpenApi();

        var streak = app.MapGroup("/api/reading-streak")
            .WithTags("Reading Progress")
            .RequireAuthorization();

        streak.MapGet("/", GetStreakHandler)
            .WithName("GetReadingStreak")
            .WithOpenApi();
    }

    private static async Task<IResult> LogSessionHandler(
        LogReadingSessionRequest payload,
        IReadingProgressService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        try
        {
            var session = await svc.LogSessionAsync(userId, payload.BookId, payload.StartTime, payload.EndTime, payload.PagesRead, payload.CurrentPage, payload.Notes);
            return Results.Created($"/api/reading-sessions/{session.Id}", new ReadingSessionDto
            {
                Id = session.Id,
                BookId = session.BookId,
                StartTime = session.StartTime,
                EndTime = session.EndTime,
                PagesRead = session.PagesRead,
                CurrentPage = session.CurrentPage,
                Notes = session.Notes,
                CreatedAt = session.CreatedAt
            });
        }
        catch (BookNotFoundException)
        {
            return Results.NotFound(new ErrorResponse { Message = "Book not found.", TraceId = httpCtx.TraceIdentifier });
        }
        catch (BookAccessDeniedException)
        {
            return Results.Json(new ErrorResponse { Message = "Access denied.", TraceId = httpCtx.TraceIdentifier }, statusCode: 403);
        }
    }

    private static async Task<IResult> GetSessionsHandler(
        Guid? bookId,
        DateTime? startDate,
        DateTime? endDate,
        IReadingProgressService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        var sessions = await svc.GetSessionsAsync(userId, bookId, startDate, endDate);
        return Results.Ok(sessions.Select(s => new ReadingSessionDto
        {
            Id = s.Id,
            BookId = s.BookId,
            StartTime = s.StartTime,
            EndTime = s.EndTime,
            PagesRead = s.PagesRead,
            CurrentPage = s.CurrentPage,
            Notes = s.Notes,
            CreatedAt = s.CreatedAt
        }));
    }

    private static async Task<IResult> GetProgressHandler(
        Guid bookId,
        IReadingProgressService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        var progress = await svc.GetProgressAsync(userId, bookId);
        if (progress is null) return Results.NotFound();

        return Results.Ok(new ReadingProgressDto
        {
            Id = progress.Id,
            BookId = progress.BookId,
            TotalPages = progress.TotalPages,
            CurrentPage = progress.CurrentPage,
            ProgressPercentage = progress.ProgressPercentage,
            EstimatedCompletionDate = progress.EstimatedCompletionDate,
            LastUpdated = progress.LastUpdated
        });
    }

    private static async Task<IResult> UpdateProgressHandler(
        Guid bookId,
        UpdateReadingProgressRequest payload,
        IReadingProgressService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        try
        {
            var progress = await svc.UpdateProgressAsync(userId, bookId, payload.CurrentPage, payload.TotalPages);
            return Results.Ok(new ReadingProgressDto
            {
                Id = progress.Id,
                BookId = progress.BookId,
                TotalPages = progress.TotalPages,
                CurrentPage = progress.CurrentPage,
                ProgressPercentage = progress.ProgressPercentage,
                EstimatedCompletionDate = progress.EstimatedCompletionDate,
                LastUpdated = progress.LastUpdated
            });
        }
        catch (BookNotFoundException)
        {
            return Results.NotFound(new ErrorResponse { Message = "Book not found.", TraceId = httpCtx.TraceIdentifier });
        }
        catch (BookAccessDeniedException)
        {
            return Results.Json(new ErrorResponse { Message = "Access denied.", TraceId = httpCtx.TraceIdentifier }, statusCode: 403);
        }
    }

    private static async Task<IResult> GetStreakHandler(
        IReadingProgressService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        var streak = await svc.GetStreakAsync(userId);
        return Results.Ok(new ReadingStreakDto
        {
            CurrentStreak = streak.CurrentStreak,
            LongestStreak = streak.LongestStreak,
            LastReadDate = streak.LastReadDate
        });
    }

    private static string? GetUserId(HttpContext httpCtx)
    {
        return httpCtx.User.FindFirstValue(JwtRegisteredClaimNames.Sub)
               ?? httpCtx.User.FindFirstValue(ClaimTypes.NameIdentifier);
    }
}
