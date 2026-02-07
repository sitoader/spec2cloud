using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using BookTracker.Api.Models.Auth;
using BookTracker.Api.Models.Books;
using BookTracker.Core.Entities;
using BookTracker.Infrastructure.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace BookTracker.Api.Tests.Integration;

/// <summary>
/// End-to-end tests for the /api/books/* endpoints.
/// Uses an in-memory database so no external SQL Server is needed.
/// </summary>
public class BookEndpointTests : IClassFixture<BookEndpointTests.BookTrackerTestApp>
{
    private readonly BookTrackerTestApp _appFactory;
    private const string StrongPassword = "SecurePass99";

    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public BookEndpointTests(BookTrackerTestApp appFactory) => _appFactory = appFactory;

    // ── POST /api/books ─────────────────────────────────────────

    [Fact]
    public async Task AddBook_ValidPayload_Returns201WithBookDto()
    {
        var (client, _) = await CreateAuthenticatedClient();

        var payload = new
        {
            title = "The Great Gatsby",
            author = "F. Scott Fitzgerald",
            status = 2, // Completed
            isbn = "978-0743273565",
            genres = new[] { "Fiction", "Classic" },
        };

        var resp = await client.PostAsJsonAsync("/api/books", payload);

        Assert.Equal(HttpStatusCode.Created, resp.StatusCode);
        Assert.NotNull(resp.Headers.Location);

        var body = await resp.Content.ReadFromJsonAsync<BookDto>(JsonOpts);
        Assert.NotNull(body);
        Assert.Equal("The Great Gatsby", body!.Title);
        Assert.Equal("F. Scott Fitzgerald", body.Author);
        Assert.Equal(BookStatus.Completed, body.Status);
        Assert.NotEqual(Guid.Empty, body.Id);
    }

    [Fact]
    public async Task AddBook_DuplicateTitle_Returns409()
    {
        var (client, _) = await CreateAuthenticatedClient();

        var payload = new { title = "Duplicate Test", author = "Author", status = 0 };
        await client.PostAsJsonAsync("/api/books", payload);

        var resp = await client.PostAsJsonAsync("/api/books", payload);

        Assert.Equal(HttpStatusCode.Conflict, resp.StatusCode);
    }

    [Fact]
    public async Task AddBook_Unauthenticated_Returns401()
    {
        using var client = _appFactory.CreateClient();

        var payload = new { title = "NoAuth", author = "Author", status = 0 };
        var resp = await client.PostAsJsonAsync("/api/books", payload);

        Assert.Equal(HttpStatusCode.Unauthorized, resp.StatusCode);
    }

    // ── GET /api/books ──────────────────────────────────────────

    [Fact]
    public async Task GetBooks_ReturnsUserBooks()
    {
        var (client, _) = await CreateAuthenticatedClient();

        await client.PostAsJsonAsync("/api/books",
            new { title = "ListBook1", author = "Author", status = 0 });
        await client.PostAsJsonAsync("/api/books",
            new { title = "ListBook2", author = "Author", status = 1 });

        var resp = await client.GetAsync("/api/books");

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var json = await resp.Content.ReadAsStringAsync();
        var body = JsonSerializer.Deserialize<PaginatedResponse>(json, JsonOpts);
        Assert.NotNull(body);
        Assert.True(body!.TotalCount >= 2);
    }

    [Fact]
    public async Task GetBooks_FiltersByStatus()
    {
        var (client, _) = await CreateAuthenticatedClient();

        await client.PostAsJsonAsync("/api/books",
            new { title = "StatusFilterRead", author = "Author", status = 0 });
        await client.PostAsJsonAsync("/api/books",
            new { title = "StatusFilterCompleted", author = "Author", status = 2 });

        var resp = await client.GetAsync("/api/books?status=Completed");

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var json = await resp.Content.ReadAsStringAsync();
        var body = JsonSerializer.Deserialize<PaginatedResponse>(json, JsonOpts);
        Assert.NotNull(body);
        Assert.All(body!.Items, item => Assert.Equal(BookStatus.Completed, item.Status));
    }

    [Fact]
    public async Task GetBooks_ReturnsEmptyForNewUser()
    {
        var (client, _) = await CreateAuthenticatedClient();

        var resp = await client.GetAsync("/api/books");

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var json = await resp.Content.ReadAsStringAsync();
        var body = JsonSerializer.Deserialize<PaginatedResponse>(json, JsonOpts);
        Assert.NotNull(body);
        Assert.Equal(0, body!.TotalCount);
    }

    [Fact]
    public async Task GetBooks_Unauthenticated_Returns401()
    {
        using var client = _appFactory.CreateClient();
        var resp = await client.GetAsync("/api/books");
        Assert.Equal(HttpStatusCode.Unauthorized, resp.StatusCode);
    }

    // ── GET /api/books/{id} ─────────────────────────────────────

    [Fact]
    public async Task GetBookById_ReturnsBookDetails()
    {
        var (client, _) = await CreateAuthenticatedClient();

        var createResp = await client.PostAsJsonAsync("/api/books",
            new { title = "DetailBook", author = "Author", status = 0 });
        var created = await createResp.Content.ReadFromJsonAsync<BookDto>(JsonOpts);

        var resp = await client.GetAsync($"/api/books/{created!.Id}");

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<BookDto>(JsonOpts);
        Assert.Equal("DetailBook", body!.Title);
    }

    [Fact]
    public async Task GetBookById_NonExistent_Returns404()
    {
        var (client, _) = await CreateAuthenticatedClient();

        var resp = await client.GetAsync($"/api/books/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, resp.StatusCode);
    }

    [Fact]
    public async Task GetBookById_OtherUsersBook_Returns403()
    {
        // User A creates book
        var (clientA, _) = await CreateAuthenticatedClient();
        var createResp = await clientA.PostAsJsonAsync("/api/books",
            new { title = "UserA Book", author = "Author", status = 0 });
        var created = await createResp.Content.ReadFromJsonAsync<BookDto>(JsonOpts);

        // User B tries to access
        var (clientB, _) = await CreateAuthenticatedClient();
        var resp = await clientB.GetAsync($"/api/books/{created!.Id}");

        Assert.Equal(HttpStatusCode.Forbidden, resp.StatusCode);
    }

    // ── PUT /api/books/{id} ─────────────────────────────────────

    [Fact]
    public async Task UpdateBook_UpdatesFields()
    {
        var (client, _) = await CreateAuthenticatedClient();

        var createResp = await client.PostAsJsonAsync("/api/books",
            new { title = "UpdateMe", author = "Author", status = 0 });
        var created = await createResp.Content.ReadFromJsonAsync<BookDto>(JsonOpts);

        var updatePayload = new { title = "Updated Title", status = 2 };
        var resp = await client.PutAsJsonAsync($"/api/books/{created!.Id}", updatePayload);

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<BookDto>(JsonOpts);
        Assert.Equal("Updated Title", body!.Title);
        Assert.Equal(BookStatus.Completed, body.Status);
    }

    [Fact]
    public async Task UpdateBook_NonExistent_Returns404()
    {
        var (client, _) = await CreateAuthenticatedClient();

        var resp = await client.PutAsJsonAsync($"/api/books/{Guid.NewGuid()}",
            new { title = "X" });

        Assert.Equal(HttpStatusCode.NotFound, resp.StatusCode);
    }

    [Fact]
    public async Task UpdateBook_OtherUsersBook_Returns403()
    {
        var (clientA, _) = await CreateAuthenticatedClient();
        var createResp = await clientA.PostAsJsonAsync("/api/books",
            new { title = "UserA Update", author = "Author", status = 0 });
        var created = await createResp.Content.ReadFromJsonAsync<BookDto>(JsonOpts);

        var (clientB, _) = await CreateAuthenticatedClient();
        var resp = await clientB.PutAsJsonAsync($"/api/books/{created!.Id}",
            new { title = "Stolen" });

        Assert.Equal(HttpStatusCode.Forbidden, resp.StatusCode);
    }

    // ── PATCH /api/books/{id}/status ────────────────────────────

    [Fact]
    public async Task UpdateBookStatus_ChangesStatus()
    {
        var (client, _) = await CreateAuthenticatedClient();

        var createResp = await client.PostAsJsonAsync("/api/books",
            new { title = "StatusChange", author = "Author", status = 0 });
        var created = await createResp.Content.ReadFromJsonAsync<BookDto>(JsonOpts);

        var resp = await client.PatchAsJsonAsync(
            $"/api/books/{created!.Id}/status",
            new { status = 2 });

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<BookDto>(JsonOpts);
        Assert.Equal(BookStatus.Completed, body!.Status);
    }

    [Fact]
    public async Task UpdateBookStatus_NonExistent_Returns404()
    {
        var (client, _) = await CreateAuthenticatedClient();

        var resp = await client.PatchAsJsonAsync(
            $"/api/books/{Guid.NewGuid()}/status",
            new { status = 1 });

        Assert.Equal(HttpStatusCode.NotFound, resp.StatusCode);
    }

    // ── DELETE /api/books/{id} ──────────────────────────────────

    [Fact]
    public async Task DeleteBook_Returns204()
    {
        var (client, _) = await CreateAuthenticatedClient();

        var createResp = await client.PostAsJsonAsync("/api/books",
            new { title = "DeleteMe", author = "Author", status = 0 });
        var created = await createResp.Content.ReadFromJsonAsync<BookDto>(JsonOpts);

        var resp = await client.DeleteAsync($"/api/books/{created!.Id}");

        Assert.Equal(HttpStatusCode.NoContent, resp.StatusCode);

        // Verify it's gone
        var getResp = await client.GetAsync($"/api/books/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, getResp.StatusCode);
    }

    [Fact]
    public async Task DeleteBook_NonExistent_Returns404()
    {
        var (client, _) = await CreateAuthenticatedClient();

        var resp = await client.DeleteAsync($"/api/books/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, resp.StatusCode);
    }

    [Fact]
    public async Task DeleteBook_OtherUsersBook_Returns403()
    {
        var (clientA, _) = await CreateAuthenticatedClient();
        var createResp = await clientA.PostAsJsonAsync("/api/books",
            new { title = "UserA Delete", author = "Author", status = 0 });
        var created = await createResp.Content.ReadFromJsonAsync<BookDto>(JsonOpts);

        var (clientB, _) = await CreateAuthenticatedClient();
        var resp = await clientB.DeleteAsync($"/api/books/{created!.Id}");

        Assert.Equal(HttpStatusCode.Forbidden, resp.StatusCode);
    }

    // ── Cross-user isolation ────────────────────────────────────

    [Fact]
    public async Task UserA_CannotSeeUserB_Books()
    {
        var (clientA, _) = await CreateAuthenticatedClient();
        await clientA.PostAsJsonAsync("/api/books",
            new { title = "UserA Private", author = "Author", status = 0 });

        var (clientB, _) = await CreateAuthenticatedClient();
        var resp = await clientB.GetAsync("/api/books");
        var json = await resp.Content.ReadAsStringAsync();
        var body = JsonSerializer.Deserialize<PaginatedResponse>(json, JsonOpts);

        Assert.Equal(0, body!.TotalCount);
    }

    // ── Pagination ──────────────────────────────────────────────

    [Fact]
    public async Task GetBooks_Pagination_ReturnsCorrectSubset()
    {
        var (client, _) = await CreateAuthenticatedClient();

        // Create 5 books
        for (var i = 1; i <= 5; i++)
        {
            await client.PostAsJsonAsync("/api/books",
                new { title = $"Page Book {i}", author = "Author", status = 0 });
        }

        // Request page 2, size 2
        var resp = await client.GetAsync("/api/books?page=2&pageSize=2");
        var json = await resp.Content.ReadAsStringAsync();
        var body = JsonSerializer.Deserialize<PaginatedResponse>(json, JsonOpts);

        Assert.Equal(5, body!.TotalCount);
        Assert.Equal(2, body.Items.Length);
        Assert.Equal(2, body.Page);
        Assert.Equal(2, body.PageSize);
    }

    // ── Helpers ─────────────────────────────────────────────────

    /// <summary>
    /// Registers a fresh user and returns an HttpClient with the Bearer token set.
    /// </summary>
    private async Task<(HttpClient Client, string UserId)> CreateAuthenticatedClient()
    {
        var client = _appFactory.CreateClient();
        var email = $"book-test-{Guid.NewGuid():N}@test.local";

        var regResp = await client.PostAsJsonAsync("/api/auth/register",
            new { email, password = StrongPassword });
        var regBody = await regResp.Content.ReadFromJsonAsync<AuthResponse>(JsonOpts);

        client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", regBody!.Token);

        return (client, regBody.UserId);
    }

    /// <summary>Helper type for deserializing paginated responses.</summary>
    private record PaginatedResponse
    {
        public BookDto[] Items { get; init; } = Array.Empty<BookDto>();
        public int TotalCount { get; init; }
        public int Page { get; init; }
        public int PageSize { get; init; }
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
                var descriptorsToRemove = services
                    .Where(d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>))
                    .ToList();
                foreach (var d in descriptorsToRemove)
                    services.Remove(d);

                var dbName = $"BookTracker_BookTests_{Guid.NewGuid():N}";
                services.AddDbContext<ApplicationDbContext>(opts =>
                    opts.UseInMemoryDatabase(dbName));
            });
        }
    }
}
