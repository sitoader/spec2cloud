using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using BookTracker.Api.Models.Achievements;
using BookTracker.Core.Models;
using BookTracker.Core.Services;

namespace BookTracker.Api.Endpoints;

/// <summary>
/// Maps the /api/achievements route group for browsing achievements and badges.
/// </summary>
public static class AchievementEndpoints
{
    /// <summary>
    /// Wires up achievement routes on the supplied <paramref name="app"/>.
    /// </summary>
    public static void MapAchievementEndpoints(this IEndpointRouteBuilder app)
    {
        var achievements = app.MapGroup("/api/achievements")
            .WithTags("Achievements")
            .RequireAuthorization();

        achievements.MapGet("/", ListAllAchievementsHandler)
            .WithName("ListAllAchievements")
            .WithOpenApi()
            .Produces<AchievementDto[]>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized);

        achievements.MapGet("/user", ListUserAchievementsHandler)
            .WithName("ListUserAchievements")
            .WithOpenApi()
            .Produces<UserAchievementDto[]>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized);
    }

    // ── Handlers ────────────────────────────────────────────────

    private static async Task<IResult> ListAllAchievementsHandler(
        IAchievementService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        var achievements = await svc.ListAllBadgesAsync();
        var dtos = achievements.Select(ToAchievementDto).ToArray();
        return Results.Ok(dtos);
    }

    private static async Task<IResult> ListUserAchievementsHandler(
        IAchievementService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        var earned = await svc.ListEarnedBadgesAsync(userId);
        var dtos = earned.Select(ToUserAchievementDto).ToArray();
        return Results.Ok(dtos);
    }

    // ── Helpers ─────────────────────────────────────────────────

    private static string? GetUserId(HttpContext httpCtx)
    {
        return httpCtx.User.FindFirstValue(JwtRegisteredClaimNames.Sub)
               ?? httpCtx.User.FindFirstValue(ClaimTypes.NameIdentifier);
    }

    private static AchievementDto ToAchievementDto(Core.Entities.Achievement achievement)
    {
        return new AchievementDto
        {
            Id = achievement.Id,
            Code = achievement.Slug,
            Name = achievement.DisplayName,
            Description = achievement.Summary,
            IconUrl = achievement.BadgeImageUrl,
            Category = achievement.AchievementCategory,
            RequirementValue = achievement.ThresholdValue,
        };
    }

    private static UserAchievementDto ToUserAchievementDto(Core.Entities.UserAchievement ua)
    {
        return new UserAchievementDto
        {
            Id = ua.Id,
            AchievementId = ua.AchievementId,
            Achievement = ua.Badge is not null ? ToAchievementDto(ua.Badge) : null,
            UnlockedAt = ua.EarnedAt,
        };
    }
}
