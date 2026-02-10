using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using BookTracker.Api.Models.Authors;
using BookTracker.Api.Models.Books;
using BookTracker.Core.Entities;
using BookTracker.Core.Models;
using BookTracker.Core.Services;

namespace BookTracker.Api.Endpoints;

/// <summary>
/// Maps the /api/authors route group for managing author follows and browsing.
/// </summary>
public static class AuthorEndpoints
{
    /// <summary>
    /// Wires up author routes on the supplied <paramref name="app"/>.
    /// </summary>
    public static void MapAuthorEndpoints(this IEndpointRouteBuilder app)
    {
        var authors = app.MapGroup("/api/authors")
            .WithTags("Authors")
            .RequireAuthorization();

        authors.MapPost("/follow", FollowAuthorHandler)
            .WithName("FollowAuthor")
            .WithOpenApi()
            .Produces<FollowedAuthorDto>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status401Unauthorized);

        authors.MapDelete("/follow/{authorName}", UnfollowAuthorHandler)
            .WithName("UnfollowAuthor")
            .WithOpenApi()
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status401Unauthorized);

        authors.MapGet("/following", ListFollowedAuthorsHandler)
            .WithName("ListFollowedAuthors")
            .WithOpenApi()
            .Produces<FollowedAuthorDto[]>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized);

        authors.MapGet("/{name}/books", GetAuthorBooksHandler)
            .WithName("GetAuthorBooks")
            .WithOpenApi()
            .Produces<BookDto[]>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized);
    }

    // ── Handlers ────────────────────────────────────────────────

    private static async Task<IResult> FollowAuthorHandler(
        FollowAuthorRequest payload,
        IAuthorFollowService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        try
        {
            var followed = await svc.StartFollowingAsync(userId, payload.AuthorName, payload.NotificationsEnabled);
            var dto = ToDto(followed);
            return Results.Created($"/api/authors/follow/{dto.AuthorName}", dto);
        }
        catch (Exception ex)
        {
            return Results.Json(
                new ErrorResponse
                {
                    Message = $"Failed to follow author: {ex.Message}",
                    TraceId = httpCtx.TraceIdentifier,
                },
                statusCode: StatusCodes.Status500InternalServerError);
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
            await svc.StopFollowingAsync(userId, authorName);
            return Results.NoContent();
        }
        catch (Exception ex)
        {
            return Results.Json(
                new ErrorResponse
                {
                    Message = $"Failed to unfollow author: {ex.Message}",
                    TraceId = httpCtx.TraceIdentifier,
                },
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    private static async Task<IResult> ListFollowedAuthorsHandler(
        IAuthorFollowService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        var followed = await svc.ListFollowedAsync(userId);
        var dtos = followed.Select(ToDto).ToArray();
        return Results.Ok(dtos);
    }

    private static async Task<IResult> GetAuthorBooksHandler(
        string name,
        IAuthorFollowService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        var books = await svc.FetchAuthorLibraryAsync(userId, name);
        var dtos = books.Select(ToBookDto).ToArray();
        return Results.Ok(dtos);
    }

    // ── Helpers ─────────────────────────────────────────────────

    private static string? GetUserId(HttpContext httpCtx)
    {
        return httpCtx.User.FindFirstValue(JwtRegisteredClaimNames.Sub)
               ?? httpCtx.User.FindFirstValue(ClaimTypes.NameIdentifier);
    }

    private static FollowedAuthorDto ToDto(Core.Entities.FollowedAuthor followed)
    {
        return new FollowedAuthorDto
        {
            Id = followed.Id,
            AuthorName = followed.AuthorName,
            FollowedAt = followed.StartedFollowingAt,
            NotificationsEnabled = followed.AlertsEnabled,
        };
    }

    private static BookDto ToBookDto(Book book)
    {
        return new BookDto
        {
            Id = book.Id,
            Title = book.Title,
            Author = book.Author,
            Isbn = book.Isbn,
            CoverImageUrl = book.CoverImageUrl,
            Description = book.Description,
            PublicationDate = book.PublicationDate,
            Status = book.Status,
            AddedDate = book.AddedDate,
            CompletedDate = book.CompletedDate,
            PageCount = book.PageCount,
            Source = book.Source,
        };
    }
}
