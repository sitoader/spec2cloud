using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using BookTracker.Api.Models.Collections;
using BookTracker.Core.Exceptions;
using BookTracker.Core.Models;
using BookTracker.Core.Services;

namespace BookTracker.Api.Endpoints;

/// <summary>
/// Maps collection management endpoints.
/// </summary>
public static class CollectionEndpoints
{
    public static void MapCollectionEndpoints(this IEndpointRouteBuilder app)
    {
        var collections = app.MapGroup("/api/collections")
            .WithTags("Collections")
            .RequireAuthorization();

        collections.MapGet("/", GetUserCollectionsHandler)
            .WithName("GetUserCollections")
            .WithOpenApi();

        collections.MapPost("/", CreateCollectionHandler)
            .WithName("CreateCollection")
            .WithOpenApi();

        collections.MapGet("/{id:guid}", GetCollectionHandler)
            .WithName("GetCollection")
            .WithOpenApi();

        collections.MapPut("/{id:guid}", UpdateCollectionHandler)
            .WithName("UpdateCollection")
            .WithOpenApi();

        collections.MapDelete("/{id:guid}", DeleteCollectionHandler)
            .WithName("DeleteCollection")
            .WithOpenApi();

        collections.MapPost("/{id:guid}/books", AddBookToCollectionHandler)
            .WithName("AddBookToCollection")
            .WithOpenApi();

        collections.MapDelete("/{collectionId:guid}/books/{bookId:guid}", RemoveBookFromCollectionHandler)
            .WithName("RemoveBookFromCollection")
            .WithOpenApi();

        collections.MapGet("/public", GetPublicCollectionsHandler)
            .WithName("GetPublicCollections")
            .WithOpenApi()
            .AllowAnonymous();
    }

    private static async Task<IResult> GetUserCollectionsHandler(
        ICollectionService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        var collections = await svc.GetUserCollectionsAsync(userId);
        return Results.Ok(collections.Select(ToDto));
    }

    private static async Task<IResult> CreateCollectionHandler(
        CreateCollectionRequest payload,
        ICollectionService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        var collection = await svc.CreateCollectionAsync(userId, payload.Name, payload.Description, payload.IsPublic);
        return Results.Created($"/api/collections/{collection.Id}", ToDto(collection));
    }

    private static async Task<IResult> GetCollectionHandler(
        Guid id,
        ICollectionService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        try
        {
            var collection = await svc.GetCollectionAsync(userId, id);
            return Results.Ok(ToDto(collection));
        }
        catch (CollectionNotFoundException)
        {
            return Results.NotFound(new ErrorResponse { Message = "Collection not found.", TraceId = httpCtx.TraceIdentifier });
        }
        catch (CollectionAccessDeniedException)
        {
            return Results.Json(new ErrorResponse { Message = "Access denied.", TraceId = httpCtx.TraceIdentifier }, statusCode: 403);
        }
    }

    private static async Task<IResult> UpdateCollectionHandler(
        Guid id,
        UpdateCollectionRequest payload,
        ICollectionService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        try
        {
            var collection = await svc.UpdateCollectionAsync(userId, id, payload.Name, payload.Description, payload.IsPublic);
            return Results.Ok(ToDto(collection));
        }
        catch (CollectionNotFoundException)
        {
            return Results.NotFound(new ErrorResponse { Message = "Collection not found.", TraceId = httpCtx.TraceIdentifier });
        }
        catch (CollectionAccessDeniedException)
        {
            return Results.Json(new ErrorResponse { Message = "Access denied.", TraceId = httpCtx.TraceIdentifier }, statusCode: 403);
        }
    }

    private static async Task<IResult> DeleteCollectionHandler(
        Guid id,
        ICollectionService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        try
        {
            await svc.DeleteCollectionAsync(userId, id);
            return Results.NoContent();
        }
        catch (CollectionNotFoundException)
        {
            return Results.NotFound(new ErrorResponse { Message = "Collection not found.", TraceId = httpCtx.TraceIdentifier });
        }
        catch (CollectionAccessDeniedException)
        {
            return Results.Json(new ErrorResponse { Message = "Access denied.", TraceId = httpCtx.TraceIdentifier }, statusCode: 403);
        }
    }

    private static async Task<IResult> AddBookToCollectionHandler(
        Guid id,
        AddBookToCollectionRequest payload,
        ICollectionService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        try
        {
            var entry = await svc.AddBookToCollectionAsync(userId, id, payload.BookId, payload.Notes);
            return Results.Created($"/api/collections/{id}/books/{payload.BookId}", new CollectionBookDto
            {
                Id = entry.Id,
                BookId = entry.BookId,
                AddedAt = entry.AddedAt,
                Notes = entry.Notes
            });
        }
        catch (CollectionNotFoundException)
        {
            return Results.NotFound(new ErrorResponse { Message = "Collection not found.", TraceId = httpCtx.TraceIdentifier });
        }
        catch (CollectionAccessDeniedException)
        {
            return Results.Json(new ErrorResponse { Message = "Access denied.", TraceId = httpCtx.TraceIdentifier }, statusCode: 403);
        }
    }

    private static async Task<IResult> RemoveBookFromCollectionHandler(
        Guid collectionId,
        Guid bookId,
        ICollectionService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        try
        {
            await svc.RemoveBookFromCollectionAsync(userId, collectionId, bookId);
            return Results.NoContent();
        }
        catch (CollectionNotFoundException)
        {
            return Results.NotFound(new ErrorResponse { Message = "Collection not found.", TraceId = httpCtx.TraceIdentifier });
        }
        catch (CollectionAccessDeniedException)
        {
            return Results.Json(new ErrorResponse { Message = "Access denied.", TraceId = httpCtx.TraceIdentifier }, statusCode: 403);
        }
    }

    private static async Task<IResult> GetPublicCollectionsHandler(
        string? search,
        ICollectionService svc)
    {
        var collections = await svc.GetPublicCollectionsAsync(search);
        return Results.Ok(collections.Select(ToDto));
    }

    private static CollectionDto ToDto(Core.Entities.Collection c)
    {
        return new CollectionDto
        {
            Id = c.Id,
            Name = c.Name,
            Description = c.Description,
            IsPublic = c.IsPublic,
            BookCount = c.CollectionBooks?.Count ?? 0,
            CreatedAt = c.CreatedAt,
            UpdatedAt = c.UpdatedAt
        };
    }

    private static string? GetUserId(HttpContext httpCtx)
    {
        return httpCtx.User.FindFirstValue(JwtRegisteredClaimNames.Sub)
               ?? httpCtx.User.FindFirstValue(ClaimTypes.NameIdentifier);
    }
}
