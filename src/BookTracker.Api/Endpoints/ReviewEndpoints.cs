using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using BookTracker.Api.Models.Reviews;
using BookTracker.Core.Exceptions;
using BookTracker.Core.Models;
using BookTracker.Core.Services;

namespace BookTracker.Api.Endpoints;

/// <summary>
/// Maps enhanced book review endpoints.
/// </summary>
public static class ReviewEndpoints
{
    public static void MapReviewEndpoints(this IEndpointRouteBuilder app)
    {
        var reviews = app.MapGroup("/api/reviews")
            .WithTags("Reviews")
            .RequireAuthorization();

        reviews.MapPost("/", CreateReviewHandler)
            .WithName("CreateReview")
            .WithOpenApi();

        reviews.MapGet("/book/{bookId:guid}", GetBookReviewsHandler)
            .WithName("GetBookReviews")
            .WithOpenApi();

        reviews.MapGet("/user/{userId}", GetUserReviewsHandler)
            .WithName("GetUserReviews")
            .WithOpenApi();

        reviews.MapPut("/{id:guid}", UpdateReviewHandler)
            .WithName("UpdateReview")
            .WithOpenApi();

        reviews.MapDelete("/{id:guid}", DeleteReviewHandler)
            .WithName("DeleteReview")
            .WithOpenApi();
    }

    private static async Task<IResult> CreateReviewHandler(
        CreateReviewRequest payload,
        IBookReviewService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        try
        {
            var review = await svc.CreateReviewAsync(userId, payload.BookId, payload.Rating, payload.ReviewText, payload.ReviewHtml, payload.IsPublic, payload.Tags, payload.Mood, payload.WouldRecommend);
            return Results.Created($"/api/reviews/{review.Id}", ToDto(review));
        }
        catch (BookNotFoundException)
        {
            return Results.NotFound(new ErrorResponse { Message = "Book not found.", TraceId = httpCtx.TraceIdentifier });
        }
    }

    private static async Task<IResult> GetBookReviewsHandler(
        Guid bookId,
        IBookReviewService svc)
    {
        var reviews = await svc.GetBookReviewsAsync(bookId);
        return Results.Ok(reviews.Select(ToDto));
    }

    private static async Task<IResult> GetUserReviewsHandler(
        string userId,
        IBookReviewService svc)
    {
        var reviews = await svc.GetUserReviewsAsync(userId);
        return Results.Ok(reviews.Select(ToDto));
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
            var review = await svc.UpdateReviewAsync(userId, id, payload.Rating, payload.ReviewText, payload.ReviewHtml, payload.IsPublic, payload.Tags, payload.Mood, payload.WouldRecommend);
            return Results.Ok(ToDto(review));
        }
        catch (ReviewNotFoundException)
        {
            return Results.NotFound(new ErrorResponse { Message = "Review not found.", TraceId = httpCtx.TraceIdentifier });
        }
        catch (BookAccessDeniedException)
        {
            return Results.Json(new ErrorResponse { Message = "Access denied.", TraceId = httpCtx.TraceIdentifier }, statusCode: 403);
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
            await svc.DeleteReviewAsync(userId, id);
            return Results.NoContent();
        }
        catch (ReviewNotFoundException)
        {
            return Results.NotFound(new ErrorResponse { Message = "Review not found.", TraceId = httpCtx.TraceIdentifier });
        }
        catch (BookAccessDeniedException)
        {
            return Results.Json(new ErrorResponse { Message = "Access denied.", TraceId = httpCtx.TraceIdentifier }, statusCode: 403);
        }
    }

    private static BookReviewDto ToDto(Core.Entities.BookReview r)
    {
        string[]? tags = null;
        if (!string.IsNullOrEmpty(r.Tags))
        {
            try
            {
                tags = System.Text.Json.JsonSerializer.Deserialize<string[]>(r.Tags);
            }
            catch
            {
                // Ignore deserialization errors
            }
        }

        return new BookReviewDto
        {
            Id = r.Id,
            UserId = r.UserId,
            BookId = r.BookId,
            Rating = r.Rating,
            ReviewText = r.ReviewText,
            ReviewHtml = r.ReviewHtml,
            IsPublic = r.IsPublic,
            Tags = tags,
            Mood = r.Mood,
            WouldRecommend = r.WouldRecommend,
            CreatedAt = r.CreatedAt,
            UpdatedAt = r.UpdatedAt
        };
    }

    private static string? GetUserId(HttpContext httpCtx)
    {
        return httpCtx.User.FindFirstValue(JwtRegisteredClaimNames.Sub)
               ?? httpCtx.User.FindFirstValue(ClaimTypes.NameIdentifier);
    }
}
