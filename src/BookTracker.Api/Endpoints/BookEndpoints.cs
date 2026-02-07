using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Json;
using BookTracker.Api.Models.Books;
using BookTracker.Core.Entities;
using BookTracker.Core.Exceptions;
using BookTracker.Core.Models;
using BookTracker.Core.Services;

namespace BookTracker.Api.Endpoints;

/// <summary>
/// Maps the /api/books/* route group for managing the user's book library.
/// </summary>
public static class BookEndpoints
{
    /// <summary>
    /// Wires up book CRUD routes on the supplied <paramref name="app"/>.
    /// </summary>
    public static void MapBookEndpoints(this IEndpointRouteBuilder app)
    {
        var books = app.MapGroup("/api/books")
            .WithTags("Books")
            .RequireAuthorization();

        books.MapGet("/", GetBooksHandler)
            .WithName("GetBooks")
            .WithOpenApi()
            .Produces<BookDto[]>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized);

        books.MapGet("/{id:guid}", GetBookByIdHandler)
            .WithName("GetBookById")
            .WithOpenApi()
            .Produces<BookDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden)
            .Produces(StatusCodes.Status404NotFound);

        books.MapPost("/", AddBookHandler)
            .WithName("AddBook")
            .WithOpenApi()
            .Produces<BookDto>(StatusCodes.Status201Created)
            .Produces<ErrorResponse>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces<ErrorResponse>(StatusCodes.Status409Conflict);

        books.MapPut("/{id:guid}", UpdateBookHandler)
            .WithName("UpdateBook")
            .WithOpenApi()
            .Produces<BookDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden)
            .Produces(StatusCodes.Status404NotFound);

        books.MapPatch("/{id:guid}/status", UpdateBookStatusHandler)
            .WithName("UpdateBookStatus")
            .WithOpenApi()
            .Produces<BookDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status404NotFound);

        books.MapDelete("/{id:guid}", DeleteBookHandler)
            .WithName("DeleteBook")
            .WithOpenApi()
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden)
            .Produces(StatusCodes.Status404NotFound);
    }

    // ── Handlers ────────────────────────────────────────────────

    private static async Task<IResult> GetBooksHandler(
        IBookService svc,
        HttpContext httpCtx,
        BookStatus? status = null,
        int page = 1,
        int pageSize = 20)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 1;
        if (pageSize > 100) pageSize = 100;

        var (books, totalCount) = await svc.GetUserBooksAsync(userId, status, page, pageSize);

        var dtos = books.Select(ToDto).ToArray();

        return Results.Ok(new
        {
            items = dtos,
            totalCount,
            page,
            pageSize,
        });
    }

    private static async Task<IResult> GetBookByIdHandler(
        Guid id,
        IBookService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        try
        {
            var book = await svc.GetBookByIdAsync(userId, id);
            return Results.Ok(ToDto(book));
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

    private static async Task<IResult> AddBookHandler(
        AddBookRequest payload,
        IBookService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        try
        {
            var book = await svc.AddBookAsync(
                userId,
                payload.Title,
                payload.Author,
                payload.Isbn,
                payload.CoverImageUrl,
                payload.Description,
                payload.Genres,
                payload.PublicationDate,
                payload.Status,
                payload.Source);

            var dto = ToDto(book);
            return Results.Created($"/api/books/{dto.Id}", dto);
        }
        catch (DuplicateBookException ex)
        {
            return Results.Conflict(new ErrorResponse
            {
                Message = ex.Message,
                TraceId = httpCtx.TraceIdentifier,
            });
        }
    }

    private static async Task<IResult> UpdateBookHandler(
        Guid id,
        UpdateBookRequest payload,
        IBookService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        try
        {
            var book = await svc.UpdateBookAsync(
                userId, id,
                payload.Title,
                payload.Author,
                payload.Status,
                payload.Isbn,
                payload.CoverImageUrl,
                payload.Description,
                payload.Genres,
                payload.PublicationDate,
                payload.Source);

            return Results.Ok(ToDto(book));
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

    private static async Task<IResult> UpdateBookStatusHandler(
        Guid id,
        UpdateBookStatusRequest payload,
        IBookService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        try
        {
            var book = await svc.UpdateBookStatusAsync(userId, id, payload.Status);
            return Results.Ok(ToDto(book));
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

    private static async Task<IResult> DeleteBookHandler(
        Guid id,
        IBookService svc,
        HttpContext httpCtx)
    {
        var userId = GetUserId(httpCtx);
        if (userId is null) return Results.Unauthorized();

        try
        {
            await svc.DeleteBookAsync(userId, id);
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

    private static BookDto ToDto(Book book)
    {
        string[]? genres = null;
        if (!string.IsNullOrEmpty(book.Genres))
        {
            try
            {
                genres = JsonSerializer.Deserialize<string[]>(book.Genres);
            }
            catch (JsonException)
            {
                // If genres is not valid JSON array, treat as null
            }
        }

        return new BookDto
        {
            Id = book.Id,
            Title = book.Title,
            Author = book.Author,
            Isbn = book.Isbn,
            CoverImageUrl = book.CoverImageUrl,
            Description = book.Description,
            Genres = genres,
            PublicationDate = book.PublicationDate,
            Status = book.Status,
            AddedDate = book.AddedDate,
            Source = book.Source,
            Rating = book.Rating is not null
                ? new RatingDto
                {
                    Id = book.Rating.Id,
                    Score = book.Rating.Score,
                    Notes = book.Rating.Notes,
                    RatedDate = book.Rating.RatedDate,
                    UpdatedDate = book.Rating.UpdatedDate,
                }
                : null,
        };
    }
}
