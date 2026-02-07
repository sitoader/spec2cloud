using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using BookTracker.Api.Models.Auth;
using BookTracker.Api.Models.Books;
using BookTracker.Infrastructure.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace BookTracker.Api.Tests.Integration;

/// <summary>
/// End-to-end tests for the /api/books/{bookId}/rating endpoints.
/// Uses an in-memory database so no external SQL Server is needed.
/// </summary>
public class RatingEndpointTests : IClassFixture<RatingEndpointTests.BookTrackerTestApp>
{
    private readonly BookTrackerTestApp _appFactory;
    private const string StrongPassword = "SecurePass99";

    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public RatingEndpointTests(BookTrackerTestApp appFactory) => _appFactory = appFactory;

    // ── POST /api/books/{bookId}/rating ─────────────────────────

    [Fact]
    public async Task AddRating_ValidPayload_Returns200WithRatingDto()
    {
        var (client, bookId) = await CreateAuthenticatedClientWithBook();

        var resp = await client.PostAsJsonAsync($"/api/books/{bookId}/rating",
            new { score = 5, notes = "Amazing!" });

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<RatingDto>(JsonOpts);
        Assert.NotNull(body);
        Assert.Equal(5, body!.Score);
        Assert.Equal("Amazing!", body.Notes);
        Assert.NotEqual(Guid.Empty, body.Id);
    }

    [Fact]
    public async Task AddRating_UpsertBehavior_UpdatesExistingRating()
    {
        var (client, bookId) = await CreateAuthenticatedClientWithBook();

        // Create initial rating
        await client.PostAsJsonAsync($"/api/books/{bookId}/rating",
            new { score = 3, notes = "Good" });

        // Upsert with new score
        var resp = await client.PostAsJsonAsync($"/api/books/{bookId}/rating",
            new { score = 5, notes = "Updated" });

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<RatingDto>(JsonOpts);
        Assert.Equal(5, body!.Score);
        Assert.Equal("Updated", body.Notes);
    }

    [Fact]
    public async Task AddRating_BookNotFound_Returns404()
    {
        var (client, _) = await CreateAuthenticatedClient();

        var resp = await client.PostAsJsonAsync($"/api/books/{Guid.NewGuid()}/rating",
            new { score = 4 });

        Assert.Equal(HttpStatusCode.NotFound, resp.StatusCode);
    }

    [Fact]
    public async Task AddRating_Unauthenticated_Returns401()
    {
        using var client = _appFactory.CreateClient();

        var resp = await client.PostAsJsonAsync($"/api/books/{Guid.NewGuid()}/rating",
            new { score = 4 });

        Assert.Equal(HttpStatusCode.Unauthorized, resp.StatusCode);
    }

    // ── PUT /api/books/{bookId}/rating ──────────────────────────

    [Fact]
    public async Task UpdateRating_ExistingRating_Returns200()
    {
        var (client, bookId) = await CreateAuthenticatedClientWithBook();

        // Create rating first
        await client.PostAsJsonAsync($"/api/books/{bookId}/rating",
            new { score = 3 });

        // Update it
        var resp = await client.PutAsJsonAsync($"/api/books/{bookId}/rating",
            new { score = 5, notes = "Better now" });

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<RatingDto>(JsonOpts);
        Assert.Equal(5, body!.Score);
        Assert.Equal("Better now", body.Notes);
    }

    [Fact]
    public async Task UpdateRating_NoExistingRating_Returns404()
    {
        var (client, bookId) = await CreateAuthenticatedClientWithBook();

        var resp = await client.PutAsJsonAsync($"/api/books/{bookId}/rating",
            new { score = 4 });

        Assert.Equal(HttpStatusCode.NotFound, resp.StatusCode);
    }

    // ── DELETE /api/books/{bookId}/rating ────────────────────────

    [Fact]
    public async Task DeleteRating_ExistingRating_Returns204()
    {
        var (client, bookId) = await CreateAuthenticatedClientWithBook();

        // Create rating
        await client.PostAsJsonAsync($"/api/books/{bookId}/rating",
            new { score = 4 });

        // Delete it
        var resp = await client.DeleteAsync($"/api/books/{bookId}/rating");

        Assert.Equal(HttpStatusCode.NoContent, resp.StatusCode);
    }

    [Fact]
    public async Task DeleteRating_NoExistingRating_Returns404()
    {
        var (client, bookId) = await CreateAuthenticatedClientWithBook();

        var resp = await client.DeleteAsync($"/api/books/{bookId}/rating");

        Assert.Equal(HttpStatusCode.NotFound, resp.StatusCode);
    }

    // ── Full CRUD cycle ─────────────────────────────────────────

    [Fact]
    public async Task RatingCrud_CreateReadUpdateDelete_Works()
    {
        var (client, bookId) = await CreateAuthenticatedClientWithBook();

        // Create
        var createResp = await client.PostAsJsonAsync($"/api/books/{bookId}/rating",
            new { score = 3, notes = "Initial" });
        Assert.Equal(HttpStatusCode.OK, createResp.StatusCode);
        var created = await createResp.Content.ReadFromJsonAsync<RatingDto>(JsonOpts);
        Assert.Equal(3, created!.Score);

        // Update
        var updateResp = await client.PutAsJsonAsync($"/api/books/{bookId}/rating",
            new { score = 5, notes = "Updated" });
        Assert.Equal(HttpStatusCode.OK, updateResp.StatusCode);
        var updated = await updateResp.Content.ReadFromJsonAsync<RatingDto>(JsonOpts);
        Assert.Equal(5, updated!.Score);

        // Delete
        var deleteResp = await client.DeleteAsync($"/api/books/{bookId}/rating");
        Assert.Equal(HttpStatusCode.NoContent, deleteResp.StatusCode);

        // Verify deleted
        var deleteAgain = await client.DeleteAsync($"/api/books/{bookId}/rating");
        Assert.Equal(HttpStatusCode.NotFound, deleteAgain.StatusCode);
    }

    // ── Helpers ─────────────────────────────────────────────────

    private async Task<(HttpClient Client, string UserId)> CreateAuthenticatedClient()
    {
        var client = _appFactory.CreateClient();
        var email = $"rating-test-{Guid.NewGuid():N}@test.local";

        var regResp = await client.PostAsJsonAsync("/api/auth/register",
            new { email, password = StrongPassword });
        var regBody = await regResp.Content.ReadFromJsonAsync<AuthResponse>(JsonOpts);

        client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", regBody!.Token);

        return (client, regBody.UserId);
    }

    private async Task<(HttpClient Client, Guid BookId)> CreateAuthenticatedClientWithBook()
    {
        var (client, _) = await CreateAuthenticatedClient();

        var createResp = await client.PostAsJsonAsync("/api/books",
            new { title = $"RatingTestBook-{Guid.NewGuid():N}", author = "Author", status = 0 });
        var book = await createResp.Content.ReadFromJsonAsync<BookDto>(JsonOpts);

        return (client, book!.Id);
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

                var dbName = $"BookTracker_RatingTests_{Guid.NewGuid():N}";
                services.AddDbContext<ApplicationDbContext>(opts =>
                    opts.UseInMemoryDatabase(dbName));
            });
        }
    }
}
