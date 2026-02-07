using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using BookTracker.Api.Models.Books;
using BookTracker.Core.Exceptions;
using BookTracker.Core.Models;
using BookTracker.Core.Services;

namespace BookTracker.Api.Endpoints;

/// <summary>
/// Maps the /api/books/{bookId}/rating route group for managing book ratings.
/// </summary>
public static class RatingEndpoints
{
    /// <summary>
    /// Wires up rating routes on the supplied <paramref name="app"/>.
    /// </summary>
    public static void MapRatingEndpoints(this IEndpointRouteBuilder app)
    {
        var ratings = app.MapGroup("/api/books/{bookId:guid}/rating")
            .WithTags("Ratings")
            .RequireAuthorization();

        ratings.MapPost("/", AddOrUpdateRatingHandler)
            .WithName("AddOrUpdateRating")
            .WithOpenApi()
            .Produces<RatingDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status404NotFound);

        ratings.MapPut("/", UpdateRatingHandler)
            .WithName("UpdateRating")
            .WithOpenApi()
            .Produces<RatingDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status404NotFound);

        ratings.MapDelete("/", DeleteRatingHandler)
            .WithName("DeleteRating")
            .WithOpenApi()
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status404NotFound);
    }

    // ── Handlers ────────────────────────────────────────────────

    private static async Task<IResult> AddOrUpdateRatingHandler(
        Guid bookId,
        AddRatingRequest payload,
        IRatingService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        try
        {
            var rating = await svc.AddOrUpdateRatingAsync(userId, bookId, payload.Score, payload.Notes);
            return Results.Ok(ToDto(rating));
        }
        catch (BookNotFoundException)
        {
            return Results.NotFound(new ErrorResponse
            {
                Message = "Book not found.",
                TraceId = httpCtx.TraceIdentifier,
            });
        }
        catch (BookAccessDeniedException)
        {
            return Results.Json(
                new ErrorResponse
                {
                    Message = "You do not have permission to access this book.",
                    TraceId = httpCtx.TraceIdentifier,
                },
                statusCode: StatusCodes.Status403Forbidden);
        }
    }

    private static async Task<IResult> UpdateRatingHandler(
        Guid bookId,
        AddRatingRequest payload,
        IRatingService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        try
        {
            // Check if rating exists first
            var existing = await svc.GetBookRatingAsync(userId, bookId);
            if (existing is null)
            {
                return Results.NotFound(new ErrorResponse
                {
                    Message = "Rating not found.",
                    TraceId = httpCtx.TraceIdentifier,
                });
            }

            var rating = await svc.AddOrUpdateRatingAsync(userId, bookId, payload.Score, payload.Notes);
            return Results.Ok(ToDto(rating));
        }
        catch (BookNotFoundException)
        {
            return Results.NotFound(new ErrorResponse
            {
                Message = "Book not found.",
                TraceId = httpCtx.TraceIdentifier,
            });
        }
        catch (BookAccessDeniedException)
        {
            return Results.Json(
                new ErrorResponse
                {
                    Message = "You do not have permission to access this book.",
                    TraceId = httpCtx.TraceIdentifier,
                },
                statusCode: StatusCodes.Status403Forbidden);
        }
    }

    private static async Task<IResult> DeleteRatingHandler(
        Guid bookId,
        IRatingService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        try
        {
            await svc.DeleteRatingAsync(userId, bookId);
            return Results.NoContent();
        }
        catch (BookNotFoundException)
        {
            return Results.NotFound(new ErrorResponse
            {
                Message = "Book not found.",
                TraceId = httpCtx.TraceIdentifier,
            });
        }
        catch (RatingNotFoundException)
        {
            return Results.NotFound(new ErrorResponse
            {
                Message = "Rating not found.",
                TraceId = httpCtx.TraceIdentifier,
            });
        }
        catch (BookAccessDeniedException)
        {
            return Results.Json(
                new ErrorResponse
                {
                    Message = "You do not have permission to access this book.",
                    TraceId = httpCtx.TraceIdentifier,
                },
                statusCode: StatusCodes.Status403Forbidden);
        }
    }

    // ── Helpers ─────────────────────────────────────────────────

    private static string? GetUserId(HttpContext httpCtx)
    {
        return httpCtx.User.FindFirstValue(JwtRegisteredClaimNames.Sub)
               ?? httpCtx.User.FindFirstValue(ClaimTypes.NameIdentifier);
    }

    private static RatingDto ToDto(Core.Entities.Rating rating)
    {
        return new RatingDto
        {
            Id = rating.Id,
            Score = rating.Score,
            Notes = rating.Notes,
            RatedDate = rating.RatedDate,
            UpdatedDate = rating.UpdatedDate,
        };
    }
}
