using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using BookTracker.Api.Models.Authors;
using BookTracker.Core.Models;
using BookTracker.Core.Services;

namespace BookTracker.Api.Endpoints;

/// <summary>
/// Maps author following endpoints.
/// </summary>
public static class AuthorEndpoints
{
    public static void MapAuthorEndpoints(this IEndpointRouteBuilder app)
    {
        var authors = app.MapGroup("/api/authors")
            .WithTags("Authors")
            .RequireAuthorization();

        authors.MapPost("/follow", FollowAuthorHandler)
            .WithName("FollowAuthor")
            .WithOpenApi();

        authors.MapDelete("/follow/{authorName}", UnfollowAuthorHandler)
            .WithName("UnfollowAuthor")
            .WithOpenApi();

        authors.MapGet("/following", GetFollowedAuthorsHandler)
            .WithName("GetFollowedAuthors")
            .WithOpenApi();
    }

    private static async Task<IResult> FollowAuthorHandler(
        FollowAuthorRequest payload,
        IAuthorFollowService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        try
        {
            var followed = await svc.FollowAuthorAsync(userId, payload.AuthorName, payload.NotificationsEnabled);
            return Results.Created($"/api/authors/following", new FollowedAuthorDto
            {
                Id = followed.Id,
                AuthorName = followed.AuthorName,
                FollowedAt = followed.FollowedAt,
                NotificationsEnabled = followed.NotificationsEnabled
            });
        }
        catch (ArgumentException ex)
        {
            return Results.BadRequest(new ErrorResponse { Message = ex.Message, TraceId = httpCtx.TraceIdentifier });
        }
    }

    private static async Task<IResult> UnfollowAuthorHandler(
        string authorName,
        IAuthorFollowService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        try
        {
            await svc.UnfollowAuthorAsync(userId, authorName);
            return Results.NoContent();
        }
        catch (ArgumentException ex)
        {
            return Results.BadRequest(new ErrorResponse { Message = ex.Message, TraceId = httpCtx.TraceIdentifier });
        }
    }

    private static async Task<IResult> GetFollowedAuthorsHandler(
        IAuthorFollowService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        var authors = await svc.GetFollowedAuthorsAsync(userId);
        return Results.Ok(authors.Select(a => new FollowedAuthorDto
        {
            Id = a.Id,
            AuthorName = a.AuthorName,
            FollowedAt = a.FollowedAt,
            NotificationsEnabled = a.NotificationsEnabled
        }));
    }

    private static string? GetUserId(HttpContext httpCtx)
    {
        return httpCtx.User.FindFirstValue(JwtRegisteredClaimNames.Sub)
               ?? httpCtx.User.FindFirstValue(ClaimTypes.NameIdentifier);
    }
}
