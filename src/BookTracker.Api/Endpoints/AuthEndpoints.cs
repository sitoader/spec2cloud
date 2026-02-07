using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using BookTracker.Api.Models.Auth;
using BookTracker.Core.Exceptions;
using BookTracker.Core.Models;
using BookTracker.Core.Services;
using Microsoft.AspNetCore.Hosting;

namespace BookTracker.Api.Endpoints;

/// <summary>
/// Maps the /api/auth/* route group that exposes registration, login, logout, and
/// current-user endpoints for the BookTracker application.
/// </summary>
public static class AuthEndpoints
{
    /// <summary>Cookie name used to transport the JWT to the browser.</summary>
    internal const string SessionCookieName = "auth_token";

    /// <summary>
    /// Wires up auth routes on the supplied <paramref name="app"/>.
    /// </summary>
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var auth = app.MapGroup("/api/auth").WithTags("Authentication");

        auth.MapPost("/register", RegisterHandler)
            .AllowAnonymous()
            .WithName("Register")
            .WithOpenApi()
            .Produces<AuthResponse>(StatusCodes.Status201Created)
            .Produces<ErrorResponse>(StatusCodes.Status400BadRequest)
            .Produces<ErrorResponse>(StatusCodes.Status409Conflict);

        auth.MapPost("/login", LoginHandler)
            .AllowAnonymous()
            .WithName("Login")
            .WithOpenApi()
            .Produces<AuthResponse>(StatusCodes.Status200OK)
            .Produces<ErrorResponse>(StatusCodes.Status401Unauthorized)
            .Produces<ErrorResponse>(StatusCodes.Status423Locked);

        auth.MapPost("/logout", LogoutHandler)
            .RequireAuthorization()
            .WithName("Logout")
            .WithOpenApi()
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status401Unauthorized);

        auth.MapGet("/me", MeHandler)
            .RequireAuthorization()
            .WithName("CurrentUser")
            .WithOpenApi()
            .Produces<AuthResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized);
    }

    // ── Handlers ────────────────────────────────────────────────

    private static async Task<IResult> RegisterHandler(
        RegisterRequest payload,
        IAuthenticationService svc,
        HttpContext httpCtx)
    {
        try
        {
            var result = await svc.RegisterUserAsync(
                payload.Email, payload.Password, payload.DisplayName);

            var isDevelopment = httpCtx.RequestServices.GetRequiredService<IWebHostEnvironment>().IsDevelopment();
            WriteSessionCookie(httpCtx.Response, result.Token, result.ExpiresAtUtc, isDevelopment);
            return Results.Created("/api/auth/me", ToResponse(result));
        }
        catch (UserAlreadyExistsException ex)
        {
            return Results.Conflict(new ErrorResponse
            {
                Message = ex.Message,
                TraceId = httpCtx.TraceIdentifier,
            });
        }
        catch (ArgumentException ex)
        {
            return Results.BadRequest(new ErrorResponse
            {
                Message = "Registration validation failed.",
                Errors = ex.Message
                    .Split(' ', StringSplitOptions.RemoveEmptyEntries)
                    .ToList(),
                TraceId = httpCtx.TraceIdentifier,
            });
        }
    }

    private static async Task<IResult> LoginHandler(
        LoginRequest payload,
        IAuthenticationService svc,
        HttpContext httpCtx)
    {
        try
        {
            var result = await svc.AuthenticateUserAsync(
                payload.Email, payload.Password, payload.RememberMe);

            var isDevelopment = httpCtx.RequestServices.GetRequiredService<IWebHostEnvironment>().IsDevelopment();
            WriteSessionCookie(httpCtx.Response, result.Token, result.ExpiresAtUtc, isDevelopment);
            return Results.Ok(ToResponse(result));
        }
        catch (Core.Exceptions.AuthenticationException)
        {
            return Results.Json(
                new ErrorResponse
                {
                    Message = "Invalid credentials.",
                    TraceId = httpCtx.TraceIdentifier,
                },
                statusCode: StatusCodes.Status401Unauthorized);
        }
        catch (AccountLockedException ex)
        {
            return Results.Json(
                new ErrorResponse
                {
                    Message = ex.Message,
                    TraceId = httpCtx.TraceIdentifier,
                },
                statusCode: 423);
        }
    }

    private static IResult LogoutHandler(HttpContext httpCtx)
    {
        var isDevelopment = httpCtx.RequestServices.GetRequiredService<IWebHostEnvironment>().IsDevelopment();
        httpCtx.Response.Cookies.Delete(SessionCookieName, MakeCookieOptions(isDevelopment));
        return Results.NoContent();
    }

    private static async Task<IResult> MeHandler(
        IAuthenticationService svc,
        HttpContext httpCtx)
    {
        // The "sub" claim carries the user-id; fall back to NameIdentifier
        var uid = httpCtx.User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                  ?? httpCtx.User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid))
            return Results.Unauthorized();

        var profile = await svc.GetUserProfileAsync(uid);

        return Results.Ok(new
        {
            userId = profile.UserId,
            email = profile.Email,
            displayName = profile.DisplayName,
        });
    }

    // ── Helpers ─────────────────────────────────────────────────

    private static void WriteSessionCookie(
        HttpResponse response, string jwt, DateTime expiresUtc, bool isDevelopment = false)
    {
        var opts = MakeCookieOptions(isDevelopment);
        opts.Expires = new DateTimeOffset(expiresUtc);
        response.Cookies.Append(SessionCookieName, jwt, opts);
    }

    private static CookieOptions MakeCookieOptions(bool isDevelopment = false) => new()
    {
        HttpOnly = true,
        Secure = !isDevelopment, // Only require HTTPS in production
        SameSite = isDevelopment ? SameSiteMode.Lax : SameSiteMode.Strict, // Lax for local dev
        Path = "/",
    };

    private static AuthResponse ToResponse(AuthResult src) => new()
    {
        UserId = src.UserId,
        Email = src.Email,
        DisplayName = src.DisplayName,
        Token = src.Token,
        ExpiresAt = src.ExpiresAtUtc,
    };
}
