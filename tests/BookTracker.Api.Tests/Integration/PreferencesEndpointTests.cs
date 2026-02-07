using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using BookTracker.Api.Models.Auth;
using BookTracker.Api.Models.Preferences;
using BookTracker.Infrastructure.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace BookTracker.Api.Tests.Integration;

/// <summary>
/// End-to-end tests for the /api/preferences endpoints.
/// Uses an in-memory database so no external SQL Server is needed.
/// </summary>
public class PreferencesEndpointTests : IClassFixture<PreferencesEndpointTests.BookTrackerTestApp>
{
    private readonly BookTrackerTestApp _appFactory;
    private const string StrongPassword = "SecurePass99";

    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public PreferencesEndpointTests(BookTrackerTestApp appFactory) => _appFactory = appFactory;

    // ── GET /api/preferences ────────────────────────────────────

    [Fact]
    public async Task GetPreferences_CreatesDefault_WhenNoneExist()
    {
        var (client, _) = await CreateAuthenticatedClient();

        var resp = await client.GetAsync("/api/preferences");

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<UserPreferencesDto>(JsonOpts);
        Assert.NotNull(body);
        Assert.NotEqual(Guid.Empty, body!.Id);
        Assert.Null(body.PreferredGenres);
        Assert.Null(body.PreferredThemes);
        Assert.Null(body.FavoriteAuthors);
    }

    [Fact]
    public async Task GetPreferences_ReturnsSamePreferences_OnSecondCall()
    {
        var (client, _) = await CreateAuthenticatedClient();

        // First call creates defaults
        var resp1 = await client.GetAsync("/api/preferences");
        var body1 = await resp1.Content.ReadFromJsonAsync<UserPreferencesDto>(JsonOpts);

        // Second call returns same
        var resp2 = await client.GetAsync("/api/preferences");
        var body2 = await resp2.Content.ReadFromJsonAsync<UserPreferencesDto>(JsonOpts);

        Assert.Equal(body1!.Id, body2!.Id);
    }

    [Fact]
    public async Task GetPreferences_Unauthenticated_Returns401()
    {
        using var client = _appFactory.CreateClient();

        var resp = await client.GetAsync("/api/preferences");

        Assert.Equal(HttpStatusCode.Unauthorized, resp.StatusCode);
    }

    // ── PUT /api/preferences ────────────────────────────────────

    [Fact]
    public async Task UpdatePreferences_ValidPayload_Returns200()
    {
        var (client, _) = await CreateAuthenticatedClient();

        var payload = new
        {
            preferredGenres = new[] { "Science Fiction", "Mystery" },
            preferredThemes = new[] { "Adventure" },
            favoriteAuthors = new[] { "Isaac Asimov" },
        };

        var resp = await client.PutAsJsonAsync("/api/preferences", payload);

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<UserPreferencesDto>(JsonOpts);
        Assert.NotNull(body);
        Assert.Contains("Science Fiction", body!.PreferredGenres!);
        Assert.Contains("Mystery", body.PreferredGenres!);
        Assert.Contains("Adventure", body.PreferredThemes!);
        Assert.Contains("Isaac Asimov", body.FavoriteAuthors!);
    }

    [Fact]
    public async Task UpdatePreferences_PersistsChanges()
    {
        var (client, _) = await CreateAuthenticatedClient();

        var payload = new
        {
            preferredGenres = new[] { "Fantasy" },
            preferredThemes = new[] { "Magic" },
            favoriteAuthors = new[] { "Tolkien" },
        };

        await client.PutAsJsonAsync("/api/preferences", payload);

        // Verify changes persist
        var getResp = await client.GetAsync("/api/preferences");
        var body = await getResp.Content.ReadFromJsonAsync<UserPreferencesDto>(JsonOpts);
        Assert.Contains("Fantasy", body!.PreferredGenres!);
        Assert.Contains("Magic", body.PreferredThemes!);
        Assert.Contains("Tolkien", body.FavoriteAuthors!);
    }

    [Fact]
    public async Task UpdatePreferences_EmptyArrays_HandledCorrectly()
    {
        var (client, _) = await CreateAuthenticatedClient();

        var payload = new
        {
            preferredGenres = Array.Empty<string>(),
            preferredThemes = Array.Empty<string>(),
            favoriteAuthors = Array.Empty<string>(),
        };

        var resp = await client.PutAsJsonAsync("/api/preferences", payload);

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<UserPreferencesDto>(JsonOpts);
        Assert.NotNull(body);
        // Empty arrays should be deserialized
        Assert.Empty(body!.PreferredGenres!);
        Assert.Empty(body.PreferredThemes!);
        Assert.Empty(body.FavoriteAuthors!);
    }

    [Fact]
    public async Task UpdatePreferences_CreatesIfNoneExist_UpsertBehavior()
    {
        var (client, _) = await CreateAuthenticatedClient();

        // Put without prior Get - should create
        var payload = new
        {
            preferredGenres = new[] { "Horror" },
        };

        var resp = await client.PutAsJsonAsync("/api/preferences", payload);

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<UserPreferencesDto>(JsonOpts);
        Assert.Contains("Horror", body!.PreferredGenres!);
    }

    // ── Cross-user isolation ────────────────────────────────────

    [Fact]
    public async Task PreferencesAreUniquePerUser()
    {
        var (clientA, _) = await CreateAuthenticatedClient();
        var (clientB, _) = await CreateAuthenticatedClient();

        // User A sets preferences
        await clientA.PutAsJsonAsync("/api/preferences", new
        {
            preferredGenres = new[] { "Romance" },
        });

        // User B should have empty/default preferences
        var respB = await clientB.GetAsync("/api/preferences");
        var bodyB = await respB.Content.ReadFromJsonAsync<UserPreferencesDto>(JsonOpts);
        Assert.Null(bodyB!.PreferredGenres);
    }

    // ── Helpers ─────────────────────────────────────────────────

    private async Task<(HttpClient Client, string UserId)> CreateAuthenticatedClient()
    {
        var client = _appFactory.CreateClient();
        var email = $"prefs-test-{Guid.NewGuid():N}@test.local";

        var regResp = await client.PostAsJsonAsync("/api/auth/register",
            new { email, password = StrongPassword });
        var regBody = await regResp.Content.ReadFromJsonAsync<AuthResponse>(JsonOpts);

        client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", regBody!.Token);

        return (client, regBody.UserId);
    }

    // ── Custom WebApplicationFactory ────────────────────────────

    public class BookTrackerTestApp : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Development");

            builder.ConfigureServices(services =>
            {
                var descriptorsToRemove = services
                    .Where(d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>))
                    .ToList();
                foreach (var d in descriptorsToRemove)
                    services.Remove(d);

                var dbName = $"BookTracker_PrefsTests_{Guid.NewGuid():N}";
                services.AddDbContext<ApplicationDbContext>(opts =>
                    opts.UseInMemoryDatabase(dbName));
            });
        }
    }
}
