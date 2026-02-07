using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using BookTracker.Api.Models.Auth;
using BookTracker.Core.Entities;
using BookTracker.Infrastructure.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace BookTracker.Api.Tests.Integration;

/// <summary>
/// End-to-end tests for POST /api/auth/register, POST /api/auth/login,
/// POST /api/auth/logout, and GET /api/auth/me.
/// Uses an in-memory database so no external SQL Server is needed.
/// </summary>
public class AuthEndpointTests : IClassFixture<AuthEndpointTests.BookTrackerTestApp>
{
    private readonly BookTrackerTestApp _appFactory;

    // Shared test credentials
    private const string ValidEmail = "integration-test@booktracker.local";
    private const string StrongPassword = "SecurePass99";

    public AuthEndpointTests(BookTrackerTestApp appFactory) => _appFactory = appFactory;

    // ── Registration ────────────────────────────────────────────

    [Fact]
    public async Task Register_ValidPayload_Returns201WithToken()
    {
        using var client = _appFactory.CreateClient();

        var payload = new { email = $"new-{Guid.NewGuid():N}@test.local", password = StrongPassword, displayName = "TestUser" };
        var resp = await client.PostAsJsonAsync("/api/auth/register", payload);

        Assert.Equal(HttpStatusCode.Created, resp.StatusCode);

        var body = await DeserializeBody(resp);
        Assert.False(string.IsNullOrWhiteSpace(body.Token));
        Assert.False(string.IsNullOrWhiteSpace(body.UserId));
        Assert.Equal(payload.email, body.Email);
        Assert.Equal("TestUser", body.DisplayName);
    }

    [Fact]
    public async Task Register_SetsHttpOnlyCookie()
    {
        using var client = _appFactory.CreateClient(
            new WebApplicationFactoryClientOptions { HandleCookies = false });

        var payload = new { email = $"cookie-{Guid.NewGuid():N}@test.local", password = StrongPassword };
        var resp = await client.PostAsJsonAsync("/api/auth/register", payload);

        Assert.True(resp.Headers.Contains("Set-Cookie"));
        var cookieHeader = resp.Headers.GetValues("Set-Cookie").First();
        Assert.Contains("auth_token", cookieHeader);
        Assert.Contains("httponly", cookieHeader, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Register_DuplicateEmail_Returns409()
    {
        using var client = _appFactory.CreateClient();
        var uniqueEmail = $"dup-{Guid.NewGuid():N}@test.local";

        // First registration succeeds
        await client.PostAsJsonAsync("/api/auth/register",
            new { email = uniqueEmail, password = StrongPassword });

        // Second with same email should conflict
        var resp = await client.PostAsJsonAsync("/api/auth/register",
            new { email = uniqueEmail, password = StrongPassword });

        Assert.Equal(HttpStatusCode.Conflict, resp.StatusCode);
    }

    [Fact]
    public async Task Register_WeakPassword_Returns400()
    {
        using var client = _appFactory.CreateClient();

        var resp = await client.PostAsJsonAsync("/api/auth/register",
            new { email = $"weak-{Guid.NewGuid():N}@test.local", password = "short" });

        Assert.Equal(HttpStatusCode.BadRequest, resp.StatusCode);
    }

    // ── Login ───────────────────────────────────────────────────

    [Fact]
    public async Task Login_ValidCredentials_Returns200WithToken()
    {
        using var client = _appFactory.CreateClient();
        var email = $"login-ok-{Guid.NewGuid():N}@test.local";

        // Set up the user first
        await client.PostAsJsonAsync("/api/auth/register",
            new { email, password = StrongPassword });

        var resp = await client.PostAsJsonAsync("/api/auth/login",
            new { email, password = StrongPassword });

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var body = await DeserializeBody(resp);
        Assert.False(string.IsNullOrWhiteSpace(body.Token));
    }

    [Fact]
    public async Task Login_WrongPassword_Returns401()
    {
        using var client = _appFactory.CreateClient();
        var email = $"login-fail-{Guid.NewGuid():N}@test.local";

        await client.PostAsJsonAsync("/api/auth/register",
            new { email, password = StrongPassword });

        var resp = await client.PostAsJsonAsync("/api/auth/login",
            new { email, password = "WrongPassword1" });

        Assert.Equal(HttpStatusCode.Unauthorized, resp.StatusCode);
    }

    [Fact]
    public async Task Login_NonexistentUser_Returns401()
    {
        using var client = _appFactory.CreateClient();

        var resp = await client.PostAsJsonAsync("/api/auth/login",
            new { email = "nobody@nowhere.local", password = StrongPassword });

        Assert.Equal(HttpStatusCode.Unauthorized, resp.StatusCode);
    }

    [Fact]
    public async Task Login_AccountLocksAfterFiveFailures()
    {
        using var client = _appFactory.CreateClient();
        var email = $"lockout-{Guid.NewGuid():N}@test.local";

        await client.PostAsJsonAsync("/api/auth/register",
            new { email, password = StrongPassword });

        // Burn through the allowed failures
        for (var attempt = 0; attempt < 5; attempt++)
        {
            await client.PostAsJsonAsync("/api/auth/login",
                new { email, password = "BadPassword1!" });
        }

        // This attempt should reflect the lockout
        var lockedResp = await client.PostAsJsonAsync("/api/auth/login",
            new { email, password = StrongPassword });

        // Could be 423 (caught as locked) or 401 (locked is detected before password check)
        Assert.True(
            lockedResp.StatusCode == (HttpStatusCode)423 ||
            lockedResp.StatusCode == HttpStatusCode.Unauthorized,
            $"Expected 423 or 401 but got {(int)lockedResp.StatusCode}");
    }

    // ── Logout ──────────────────────────────────────────────────

    [Fact]
    public async Task Logout_Authenticated_Returns204()
    {
        using var client = _appFactory.CreateClient();
        var email = $"logout-{Guid.NewGuid():N}@test.local";

        var regResp = await client.PostAsJsonAsync("/api/auth/register",
            new { email, password = StrongPassword });
        var regBody = await DeserializeBody(regResp);

        // Attach bearer token for the protected endpoint
        client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", regBody.Token);

        var resp = await client.PostAsync("/api/auth/logout", null);
        Assert.Equal(HttpStatusCode.NoContent, resp.StatusCode);
    }

    [Fact]
    public async Task Logout_Unauthenticated_Returns401()
    {
        using var client = _appFactory.CreateClient();
        var resp = await client.PostAsync("/api/auth/logout", null);
        Assert.Equal(HttpStatusCode.Unauthorized, resp.StatusCode);
    }

    // ── Current User (GET /me) ──────────────────────────────────

    [Fact]
    public async Task Me_WithValidToken_ReturnsProfile()
    {
        using var client = _appFactory.CreateClient();
        var email = $"me-ok-{Guid.NewGuid():N}@test.local";

        var regResp = await client.PostAsJsonAsync("/api/auth/register",
            new { email, password = StrongPassword, displayName = "Tester" });
        var regBody = await DeserializeBody(regResp);

        client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", regBody.Token);

        var resp = await client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);

        var json = await resp.Content.ReadAsStringAsync();
        Assert.Contains(email, json);
    }

    [Fact]
    public async Task Me_WithoutToken_Returns401()
    {
        using var client = _appFactory.CreateClient();
        var resp = await client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.Unauthorized, resp.StatusCode);
    }

    // ── Helpers ─────────────────────────────────────────────────

    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    private static async Task<AuthResponse> DeserializeBody(HttpResponseMessage resp)
    {
        var raw = await resp.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<AuthResponse>(raw, JsonOpts)
               ?? throw new InvalidOperationException("Could not parse auth response body");
    }

    // ── Custom WebApplicationFactory ────────────────────────────

    /// <summary>
    /// Overrides the default host configuration to swap SQL Server for an
    /// in-memory EF Core provider so the tests run without infrastructure.
    /// </summary>
    public class BookTrackerTestApp : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Development");

            builder.ConfigureServices(services =>
            {
                // Remove every DbContextOptions registration
                var descriptorsToRemove = services
                    .Where(d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>))
                    .ToList();
                foreach (var d in descriptorsToRemove)
                    services.Remove(d);

                // Use a unique in-memory database per test app instance
                var dbName = $"BookTracker_AuthTests_{Guid.NewGuid():N}";
                services.AddDbContext<ApplicationDbContext>(opts =>
                    opts.UseInMemoryDatabase(dbName));
            });
        }
    }
}
