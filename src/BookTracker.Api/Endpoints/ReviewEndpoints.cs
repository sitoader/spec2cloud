using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Json;
using BookTracker.Api.Models.Reviews;
using BookTracker.Core.Models;
using BookTracker.Core.Services;

namespace BookTracker.Api.Endpoints;

/// <summary>
/// Maps the /api/reviews route group for managing book reviews.
/// </summary>
public static class ReviewEndpoints
{
    /// <summary>
    /// Wires up review routes on the supplied <paramref name="app"/>.
    /// </summary>
    public static void MapReviewEndpoints(this IEndpointRouteBuilder app)
    {
        var reviews = app.MapGroup("/api/reviews")
            .WithTags("Reviews")
            .RequireAuthorization();

        reviews.MapPost("/", CreateReviewHandler)
            .WithName("CreateReview")
            .WithOpenApi()
            .Produces<BookReviewDto>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status401Unauthorized);

        reviews.MapGet("/book/{bookId:guid}", GetBookReviewsHandler)
            .WithName("GetBookReviews")
            .WithOpenApi()
            .Produces<BookReviewDto[]>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized);

        reviews.MapGet("/user/{userId}", GetUserReviewsHandler)
            .WithName("GetUserReviews")
            .WithOpenApi()
            .Produces<BookReviewDto[]>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized);

        reviews.MapPut("/{id:guid}", UpdateReviewHandler)
            .WithName("UpdateReview")
            .WithOpenApi()
            .Produces<BookReviewDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized);

        reviews.MapDelete("/{id:guid}", DeleteReviewHandler)
            .WithName("DeleteReview")
            .WithOpenApi()
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status401Unauthorized);
    }

    // ── Handlers ────────────────────────────────────────────────

    private static async Task<IResult> CreateReviewHandler(
        CreateReviewRequest payload,
        IBookReviewService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        try
        {
            var review = await svc.ComposeReviewAsync(
                userId,
                payload.BookId,
                payload.Rating,
                payload.ReviewText,
                payload.ReviewHtml,
                payload.IsPublic,
                payload.Tags,
                payload.Mood,
                payload.WouldRecommend);

            var dto = ToDto(review);
            return Results.Created($"/api/reviews/{dto.Id}", dto);
        }
        catch (Exception ex)
        {
            return Results.Json(
                new ErrorResponse
                {
                    Message = $"Failed to create review: {ex.Message}",
                    TraceId = httpCtx.TraceIdentifier,
                },
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    private static async Task<IResult> GetBookReviewsHandler(
        Guid bookId,
        IBookReviewService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        var reviews = await svc.ListBookReviewsAsync(bookId);
        var dtos = reviews.Select(ToDto).ToArray();
        return Results.Ok(dtos);
    }

    private static async Task<IResult> GetUserReviewsHandler(
        string userId,
        IBookReviewService svc,
        HttpContext httpCtx)
    {
        var currentUserId = GetUserId(httpCtx);
        if (currentUserId is null) return Results.Unauthorized();

        var reviews = await svc.ListReviewerReviewsAsync(userId);
        var dtos = reviews.Select(ToDto).ToArray();
        return Results.Ok(dtos);
    }

    private static async Task<IResult> UpdateReviewHandler(
        Guid id,
        UpdateReviewRequest payload,
        IBookReviewService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        try
        {
            var review = await svc.ReviseReviewAsync(
                userId,
                id,
                payload.Rating,
                payload.ReviewText,
                payload.ReviewHtml,
                payload.IsPublic,
                payload.Tags,
                payload.Mood,
                payload.WouldRecommend);

            return Results.Ok(ToDto(review));
        }
        catch (Exception ex)
        {
            return Results.Json(
                new ErrorResponse
                {
                    Message = $"Failed to update review: {ex.Message}",
                    TraceId = httpCtx.TraceIdentifier,
                },
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    private static async Task<IResult> DeleteReviewHandler(
        Guid id,
        IBookReviewService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        try
        {
            await svc.RemoveReviewAsync(userId, id);
            return Results.NoContent();
        }
        catch (Exception ex)
        {
            return Results.Json(
                new ErrorResponse
                {
                    Message = $"Failed to delete review: {ex.Message}",
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

    private static BookReviewDto ToDto(Core.Entities.BookReview review)
    {
        string[]? tags = null;
        if (!string.IsNullOrEmpty(review.TagsJson))
        {
            try
            {
                tags = JsonSerializer.Deserialize<string[]>(review.TagsJson);
            }
            catch (JsonException)
            {
                // If tags is not valid JSON array, treat as null
            }
        }

        return new BookReviewDto
        {
            Id = review.Id,
            UserId = review.UserId,
            ReviewerDisplayName = review.Reviewer?.DisplayName ?? review.Reviewer?.UserName,
            BookId = review.BookId,
            Rating = review.Stars,
            ReviewText = review.PlainTextBody,
            ReviewHtml = review.FormattedBody,
            IsPublic = review.IsVisible,
            Tags = tags,
            Mood = review.ReadingMood,
            WouldRecommend = review.Recommended,
            CreatedAt = review.WrittenAt,
            UpdatedAt = review.ModifiedAt,
        };
    }
}
