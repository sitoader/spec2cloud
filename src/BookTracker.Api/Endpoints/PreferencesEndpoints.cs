using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Json;
using BookTracker.Api.Models.Preferences;
using BookTracker.Core.Models;
using BookTracker.Core.Services;

namespace BookTracker.Api.Endpoints;

/// <summary>
/// Maps the /api/preferences route group for managing user reading preferences.
/// </summary>
public static class PreferencesEndpoints
{
    /// <summary>
    /// Wires up preferences routes on the supplied <paramref name="app"/>.
    /// </summary>
    public static void MapPreferencesEndpoints(this IEndpointRouteBuilder app)
    {
        var prefs = app.MapGroup("/api/preferences")
            .WithTags("Preferences")
            .RequireAuthorization();

        prefs.MapGet("/", GetPreferencesHandler)
            .WithName("GetPreferences")
            .WithOpenApi()
            .Produces<UserPreferencesDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized);

        prefs.MapPut("/", UpdatePreferencesHandler)
            .WithName("UpdatePreferences")
            .WithOpenApi()
            .Produces<UserPreferencesDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized);
    }

    // ── Handlers ────────────────────────────────────────────────

    private static async Task<IResult> GetPreferencesHandler(
        IPreferencesService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        var prefs = await svc.GetUserPreferencesAsync(userId);
        return Results.Ok(ToDto(prefs));
    }

    private static async Task<IResult> UpdatePreferencesHandler(
        UpdatePreferencesRequest payload,
        IPreferencesService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        var prefs = await svc.UpdatePreferencesAsync(
            userId,
            payload.PreferredGenres,
            payload.PreferredThemes,
            payload.FavoriteAuthors);

        return Results.Ok(ToDto(prefs));
    }

    // ── Helpers ─────────────────────────────────────────────────

    private static string? GetUserId(HttpContext httpCtx)
    {
        return httpCtx.User.FindFirstValue(JwtRegisteredClaimNames.Sub)
               ?? httpCtx.User.FindFirstValue(ClaimTypes.NameIdentifier);
    }

    private static UserPreferencesDto ToDto(Core.Entities.UserPreferences prefs)
    {
        return new UserPreferencesDto
        {
            Id = prefs.Id,
            PreferredGenres = DeserializeArray(prefs.PreferredGenres),
            PreferredThemes = DeserializeArray(prefs.PreferredThemes),
            FavoriteAuthors = DeserializeArray(prefs.FavoriteAuthors),
            CreatedDate = prefs.CreatedDate,
            UpdatedDate = prefs.UpdatedDate,
        };
    }

    private static string[]? DeserializeArray(string? json)
    {
        if (string.IsNullOrEmpty(json))
            return null;

        try
        {
            return JsonSerializer.Deserialize<string[]>(json);
        }
        catch (JsonException)
        {
            return null;
        }
    }
}
