using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using BookTracker.Api.Models.Goals;
using BookTracker.Core.Entities;
using BookTracker.Core.Models;
using BookTracker.Core.Services;

namespace BookTracker.Api.Endpoints;

/// <summary>
/// Maps the /api/reading-goals route group for managing reading goals.
/// </summary>
public static class ReadingGoalEndpoints
{
    /// <summary>
    /// Wires up reading goal routes on the supplied <paramref name="app"/>.
    /// </summary>
    public static void MapReadingGoalEndpoints(this IEndpointRouteBuilder app)
    {
        var goals = app.MapGroup("/api/reading-goals")
            .WithTags("ReadingGoals")
            .RequireAuthorization();

        goals.MapPost("/", CreateGoalHandler)
            .WithName("CreateReadingGoal")
            .WithOpenApi()
            .Produces<ReadingGoalDto>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status401Unauthorized);

        goals.MapGet("/{year:int}", GetGoalHandler)
            .WithName("GetReadingGoal")
            .WithOpenApi()
            .Produces<ReadingGoalDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status404NotFound);

        goals.MapPut("/{year:int}", UpdateGoalHandler)
            .WithName("UpdateReadingGoal")
            .WithOpenApi()
            .Produces<ReadingGoalDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status404NotFound);
    }

    // ── Handlers ────────────────────────────────────────────────

    private static async Task<IResult> CreateGoalHandler(
        CreateGoalRequest payload,
        IReadingGoalService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        try
        {
            var goal = await svc.EstablishGoalAsync(userId, payload.Year, payload.TargetBooksCount);
            return Results.Created($"/api/reading-goals/{goal.TargetYear}", ToDto(goal));
        }
        catch (Exception ex)
        {
            return Results.Json(
                new ErrorResponse
                {
                    Message = $"Failed to create goal: {ex.Message}",
                    TraceId = httpCtx.TraceIdentifier,
                },
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    private static async Task<IResult> GetGoalHandler(
        int year,
        IReadingGoalService svc,
        IBookService bookSvc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        var goal = await svc.FetchGoalAsync(userId, year);
        if (goal is null)
        {
            return Results.NotFound(new ErrorResponse
            {
                Message = "Reading goal not found.",
                TraceId = httpCtx.TraceIdentifier,
            });
        }

        // Compute completed books count dynamically from actual book data
        var books = await bookSvc.GetUserBooksAsync(userId, BookStatus.Completed, 1, int.MaxValue);
        var completedInYear = books.Books.Count(b => (b.CompletedDate ?? b.AddedDate).Year == year);

        return Results.Ok(ToDtoWithCount(goal, completedInYear));
    }

    private static async Task<IResult> UpdateGoalHandler(
        int year,
        UpdateGoalRequest payload,
        IReadingGoalService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        try
        {
            var goal = await svc.ReviseGoalAsync(userId, year, payload.TargetBooksCount);
            return Results.Ok(ToDto(goal));
        }
        catch (Exception ex)
        {
            return Results.Json(
                new ErrorResponse
                {
                    Message = $"Failed to update goal: {ex.Message}",
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

    private static ReadingGoalDto ToDto(ReadingGoal goal)
    {
        return new ReadingGoalDto
        {
            Id = goal.Id,
            Year = goal.TargetYear,
            TargetBooksCount = goal.TargetBookCount,
            CompletedBooksCount = goal.FinishedBookCount,
            CreatedAt = goal.SetAt,
            UpdatedAt = goal.ModifiedAt,
        };
    }

    private static ReadingGoalDto ToDtoWithCount(ReadingGoal goal, int completedCount)
    {
        return new ReadingGoalDto
        {
            Id = goal.Id,
            Year = goal.TargetYear,
            TargetBooksCount = goal.TargetBookCount,
            CompletedBooksCount = completedCount,
            CreatedAt = goal.SetAt,
            UpdatedAt = goal.ModifiedAt,
        };
    }
}
