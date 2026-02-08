using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using BookTracker.Api.Models.Goals;
using BookTracker.Core.Models;
using BookTracker.Core.Services;

namespace BookTracker.Api.Endpoints;

/// <summary>
/// Maps reading goals and achievements endpoints.
/// </summary>
public static class GoalsEndpoints
{
    public static void MapGoalsEndpoints(this IEndpointRouteBuilder app)
    {
        var goals = app.MapGroup("/api/reading-goals")
            .WithTags("Goals & Achievements")
            .RequireAuthorization();

        goals.MapPost("/", SetGoalHandler)
            .WithName("SetReadingGoal")
            .WithOpenApi();

        goals.MapGet("/{year:int}", GetGoalHandler)
            .WithName("GetReadingGoal")
            .WithOpenApi();

        goals.MapPut("/{year:int}", UpdateGoalHandler)
            .WithName("UpdateReadingGoal")
            .WithOpenApi();

        var achievements = app.MapGroup("/api/achievements")
            .WithTags("Goals & Achievements")
            .RequireAuthorization();

        achievements.MapGet("/", GetAchievementsHandler)
            .WithName("GetAchievements")
            .WithOpenApi();

        achievements.MapGet("/user", GetUserAchievementsHandler)
            .WithName("GetUserAchievements")
            .WithOpenApi();
    }

    private static async Task<IResult> SetGoalHandler(
        SetReadingGoalRequest payload,
        IGoalsService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        var goal = await svc.SetGoalAsync(userId, payload.Year, payload.TargetBooksCount);
        return Results.Created($"/api/reading-goals/{goal.Year}", ToDto(goal));
    }

    private static async Task<IResult> GetGoalHandler(
        int year,
        IGoalsService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        var goal = await svc.GetGoalAsync(userId, year);
        if (goal is null) return Results.NotFound();
        return Results.Ok(ToDto(goal));
    }

    private static async Task<IResult> UpdateGoalHandler(
        int year,
        SetReadingGoalRequest payload,
        IGoalsService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        var goal = await svc.SetGoalAsync(userId, year, payload.TargetBooksCount);
        return Results.Ok(ToDto(goal));
    }

    private static async Task<IResult> GetAchievementsHandler(IGoalsService svc)
    {
        var achievements = await svc.GetAllAchievementsAsync();
        return Results.Ok(achievements.Select(a => new AchievementDto
        {
            Id = a.Id,
            Code = a.Code,
            Name = a.Name,
            Description = a.Description,
            IconUrl = a.IconUrl,
            Category = a.Category,
            RequirementValue = a.RequirementValue
        }));
    }

    private static async Task<IResult> GetUserAchievementsHandler(
        IGoalsService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        var userAchievements = await svc.GetUserAchievementsAsync(userId);
        return Results.Ok(userAchievements.Select(ua => new UserAchievementDto
        {
            Id = ua.Id,
            UnlockedAt = ua.UnlockedAt,
            Achievement = ua.Achievement is not null ? new AchievementDto
            {
                Id = ua.Achievement.Id,
                Code = ua.Achievement.Code,
                Name = ua.Achievement.Name,
                Description = ua.Achievement.Description,
                IconUrl = ua.Achievement.IconUrl,
                Category = ua.Achievement.Category,
                RequirementValue = ua.Achievement.RequirementValue
            } : null
        }));
    }

    private static ReadingGoalDto ToDto(Core.Entities.ReadingGoal goal)
    {
        return new ReadingGoalDto
        {
            Id = goal.Id,
            Year = goal.Year,
            TargetBooksCount = goal.TargetBooksCount,
            CompletedBooksCount = goal.CompletedBooksCount,
            CreatedAt = goal.CreatedAt,
            UpdatedAt = goal.UpdatedAt
        };
    }

    private static string? GetUserId(HttpContext httpCtx)
    {
        return httpCtx.User.FindFirstValue(JwtRegisteredClaimNames.Sub)
               ?? httpCtx.User.FindFirstValue(ClaimTypes.NameIdentifier);
    }
}
