using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using BookTracker.Api.Models.Collections;
using BookTracker.Core.Models;
using BookTracker.Core.Services;

namespace BookTracker.Api.Endpoints;

/// <summary>
/// Maps the /api/collections route group for managing book collections.
/// </summary>
public static class CollectionEndpoints
{
    /// <summary>
    /// Wires up collection routes on the supplied <paramref name="app"/>.
    /// </summary>
    public static void MapCollectionEndpoints(this IEndpointRouteBuilder app)
    {
        var collections = app.MapGroup("/api/collections")
            .WithTags("Collections")
            .RequireAuthorization();

        collections.MapGet("/", ListCollectionsHandler)
            .WithName("ListCollections")
            .WithOpenApi()
            .Produces<CollectionDto[]>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized);

        collections.MapPost("/", CreateCollectionHandler)
            .WithName("CreateCollection")
            .WithOpenApi()
            .Produces<CollectionDto>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status401Unauthorized);

        collections.MapGet("/{id:guid}", GetCollectionHandler)
            .WithName("GetCollection")
            .WithOpenApi()
            .Produces<CollectionDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status404NotFound);

        collections.MapPut("/{id:guid}", UpdateCollectionHandler)
            .WithName("UpdateCollection")
            .WithOpenApi()
            .Produces<CollectionDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized);

        collections.MapDelete("/{id:guid}", DeleteCollectionHandler)
            .WithName("DeleteCollection")
            .WithOpenApi()
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status401Unauthorized);

        collections.MapPost("/{id:guid}/books", AddBookToCollectionHandler)
            .WithName("AddBookToCollection")
            .WithOpenApi()
            .Produces(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status401Unauthorized);

        collections.MapDelete("/{collectionId:guid}/books/{bookId:guid}", RemoveBookFromCollectionHandler)
            .WithName("RemoveBookFromCollection")
            .WithOpenApi()
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status401Unauthorized);

        collections.MapGet("/public", BrowsePublicCollectionsHandler)
            .WithName("BrowsePublicCollections")
            .WithOpenApi()
            .Produces<CollectionDto[]>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized);
    }

    // ── Handlers ────────────────────────────────────────────────

    private static async Task<IResult> ListCollectionsHandler(
        ICollectionService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        var collections = await svc.ListOwnerCollectionsAsync(userId);
        var dtos = collections.Select(ToDto).ToArray();
        return Results.Ok(dtos);
    }

    private static async Task<IResult> CreateCollectionHandler(
        CreateCollectionRequest payload,
        ICollectionService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        try
        {
            var collection = await svc.CreateCollectionAsync(userId, payload.Name, payload.Description, payload.IsPublic);
            var dto = ToDto(collection);
            return Results.Created($"/api/collections/{dto.Id}", dto);
        }
        catch (Exception ex)
        {
            return Results.Json(
                new ErrorResponse
                {
                    Message = $"Failed to create collection: {ex.Message}",
                    TraceId = httpCtx.TraceIdentifier,
                },
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    private static async Task<IResult> GetCollectionHandler(
        Guid id,
        ICollectionService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        var collection = await svc.FetchCollectionAsync(id);
        if (collection is null)
        {
            return Results.NotFound(new ErrorResponse
            {
                Message = "Collection not found.",
                TraceId = httpCtx.TraceIdentifier,
            });
        }

        return Results.Ok(ToDto(collection));
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
            var collection = await svc.ReviseCollectionAsync(userId, id, payload.Name, payload.Description, payload.IsPublic);
            return Results.Ok(ToDto(collection));
        }
        catch (Exception ex)
        {
            return Results.Json(
                new ErrorResponse
                {
                    Message = $"Failed to update collection: {ex.Message}",
                    TraceId = httpCtx.TraceIdentifier,
                },
                statusCode: StatusCodes.Status500InternalServerError);
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
            await svc.RemoveCollectionAsync(userId, id);
            return Results.NoContent();
        }
        catch (Exception ex)
        {
            return Results.Json(
                new ErrorResponse
                {
                    Message = $"Failed to delete collection: {ex.Message}",
                    TraceId = httpCtx.TraceIdentifier,
                },
                statusCode: StatusCodes.Status500InternalServerError);
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
            await svc.AttachBookAsync(userId, id, payload.BookId, payload.Notes);
            return Results.Created($"/api/collections/{id}/books/{payload.BookId}", null);
        }
        catch (Exception ex)
        {
            return Results.Json(
                new ErrorResponse
                {
                    Message = $"Failed to add book to collection: {ex.Message}",
                    TraceId = httpCtx.TraceIdentifier,
                },
                statusCode: StatusCodes.Status500InternalServerError);
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
            await svc.DetachBookAsync(userId, collectionId, bookId);
            return Results.NoContent();
        }
        catch (Exception ex)
        {
            return Results.Json(
                new ErrorResponse
                {
                    Message = $"Failed to remove book from collection: {ex.Message}",
                    TraceId = httpCtx.TraceIdentifier,
                },
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    private static async Task<IResult> BrowsePublicCollectionsHandler(
        ICollectionService svc,
        HttpContext httpCtx,
        string? search = null)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        var collections = await svc.BrowseVisibleCollectionsAsync(search);
        var dtos = collections.Select(ToDto).ToArray();
        return Results.Ok(dtos);
    }

    // ── Helpers ─────────────────────────────────────────────────

    private static string? GetUserId(HttpContext httpCtx)
    {
        return httpCtx.User.FindFirstValue(JwtRegisteredClaimNames.Sub)
               ?? httpCtx.User.FindFirstValue(ClaimTypes.NameIdentifier);
    }

    private static CollectionDto ToDto(Core.Entities.Collection collection)
    {
        return new CollectionDto
        {
            Id = collection.Id,
            Name = collection.Label,
            Description = collection.Summary,
            IsPublic = collection.IsVisible,
            BookCount = collection.Items.Count,
            CreatedAt = collection.SetAt,
            UpdatedAt = collection.ModifiedAt,
        };
    }
}
