using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using BookTracker.Api.Models.Recommendations;
using BookTracker.Core.Models;
using BookTracker.Core.Services;

namespace BookTracker.Api.Endpoints;

/// <summary>
/// Maps the /api/recommendations route group for AI-powered book recommendations.
/// </summary>
public static class RecommendationEndpoints
{
    /// <summary>
    /// Wires up recommendation routes on the supplied <paramref name="app"/>.
    /// </summary>
    public static void MapRecommendationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/recommendations")
            .WithTags("Recommendations")
            .RequireAuthorization();

        group.MapPost("/generate", GenerateRecommendationsHandler)
            .WithName("GenerateRecommendations")
            .WithOpenApi()
            .Produces<RecommendationsResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status429TooManyRequests)
            .Produces(StatusCodes.Status503ServiceUnavailable);
    }

    // ── Handlers ────────────────────────────────────────────────

    private static async Task<IResult> GenerateRecommendationsHandler(
        IRecommendationService recommendationService,
        HttpContext httpCtx,
        GenerateRecommendationsRequest? request)
    {
        var userId = httpCtx.User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                     ?? httpCtx.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Results.Json(
                new ErrorResponse { Message = "Unauthorized.", TraceId = httpCtx.TraceIdentifier },
                statusCode: StatusCodes.Status401Unauthorized);
        }

        var count = request?.Count ?? 5;
        if (count < 1 || count > 10)
        {
            return Results.BadRequest(new ErrorResponse
            {
                Message = "Count must be between 1 and 10.",
                TraceId = httpCtx.TraceIdentifier,
            });
        }

        // Validate sufficient data
        var hasEnoughData = await recommendationService.ValidateUserDataAsync(userId);
        if (!hasEnoughData)
        {
            return Results.BadRequest(new ErrorResponse
            {
                Message = "You need at least 3 rated books to generate recommendations.",
                TraceId = httpCtx.TraceIdentifier,
            });
        }

        try
        {
            var result = await recommendationService.GenerateRecommendationsAsync(userId, count);

            var response = new RecommendationsResponse
            {
                Recommendations = result.Recommendations.Select(r => new BookRecommendationDto
                {
                    Title = r.Title,
                    Author = r.Author,
                    Genre = r.Genre,
                    Reason = r.Reason,
                    ConfidenceScore = r.ConfidenceScore,
                }).ToList(),
                GeneratedAt = result.GeneratedAt,
                BooksAnalyzed = result.BooksAnalyzed,
            };

            return Results.Ok(response);
        }
        catch (RateLimitExceededException)
        {
            httpCtx.Response.Headers.Append("Retry-After", "86400");
            return Results.Json(
                new ErrorResponse
                {
                    Message = "Rate limit exceeded. Maximum 10 recommendation requests per day.",
                    TraceId = httpCtx.TraceIdentifier,
                },
                statusCode: StatusCodes.Status429TooManyRequests);
        }
        catch (InsufficientDataException ex)
        {
            return Results.BadRequest(new ErrorResponse
            {
                Message = ex.Message,
                TraceId = httpCtx.TraceIdentifier,
            });
        }
        catch (OperationCanceledException)
        {
            return Results.Json(
                new ErrorResponse
                {
                    Message = "AI service timed out. Please try again later.",
                    TraceId = httpCtx.TraceIdentifier,
                },
                statusCode: StatusCodes.Status503ServiceUnavailable);
        }
        catch (Exception ex)
        {
            return Results.Json(
                new ErrorResponse
                {
                    Message = "AI service is currently unavailable. Please try again later.",
                    Errors = new List<string> { ex.Message },
                    TraceId = httpCtx.TraceIdentifier,
                },
                statusCode: StatusCodes.Status503ServiceUnavailable);
        }
    }
}
