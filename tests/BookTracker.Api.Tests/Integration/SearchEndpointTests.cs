using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using BookTracker.Api.Models.Auth;
using BookTracker.Api.Models.Search;
using BookTracker.Core.Services;
using BookTracker.Infrastructure.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NSubstitute;

namespace BookTracker.Api.Tests.Integration;

/// <summary>
/// End-to-end tests for the /api/search/* endpoints.
/// Uses an in-memory database and a mocked IBookSearchService.
/// </summary>
public class SearchEndpointTests : IClassFixture<SearchEndpointTests.SearchTestApp>
{
    private readonly SearchTestApp _appFactory;
    private const string StrongPassword = "SecurePass99";

    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public SearchEndpointTests(SearchTestApp appFactory) => _appFactory = appFactory;

    // ── GET /api/search/books ───────────────────────────────────

    [Fact]
    public async Task SearchBooks_ValidQuery_Returns200WithResults()
    {
        var (client, _) = await CreateAuthenticatedClient();

        var resp = await client.GetAsync("/api/search/books?query=clean+code");

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var results = await resp.Content.ReadFromJsonAsync<ExternalBookDto[]>(JsonOpts);
        Assert.NotNull(results);
        Assert.Single(results!);
        Assert.Equal("Test Book", results[0].Title);
        Assert.Equal("Test Author", results[0].Author);
        Assert.Equal("google-books", results[0].Source);
    }

    [Fact]
    public async Task SearchBooks_ShortQuery_Returns400()
    {
        var (client, _) = await CreateAuthenticatedClient();

        var resp = await client.GetAsync("/api/search/books?query=ab");

        Assert.Equal(HttpStatusCode.BadRequest, resp.StatusCode);
    }

    [Fact]
    public async Task SearchBooks_EmptyQuery_Returns400()
    {
        var (client, _) = await CreateAuthenticatedClient();

        var resp = await client.GetAsync("/api/search/books?query=");

        Assert.Equal(HttpStatusCode.BadRequest, resp.StatusCode);
    }

    [Fact]
    public async Task SearchBooks_NoQuery_Returns400()
    {
        var (client, _) = await CreateAuthenticatedClient();

        var resp = await client.GetAsync("/api/search/books");

        Assert.Equal(HttpStatusCode.BadRequest, resp.StatusCode);
    }

    [Fact]
    public async Task SearchBooks_Unauthenticated_Returns401()
    {
        using var client = _appFactory.CreateClient();

        var resp = await client.GetAsync("/api/search/books?query=test+search");

        Assert.Equal(HttpStatusCode.Unauthorized, resp.StatusCode);
    }

    [Fact]
    public async Task SearchBooks_ResultsContainExpectedFields()
    {
        var (client, _) = await CreateAuthenticatedClient();

        var resp = await client.GetAsync("/api/search/books?query=clean+code");
        var results = await resp.Content.ReadFromJsonAsync<ExternalBookDto[]>(JsonOpts);

        Assert.NotNull(results);
        var book = results![0];
        Assert.Equal("ext-1", book.ExternalId);
        Assert.Equal("978-0000000000", book.Isbn);
        Assert.Equal("https://img.test.com/cover.jpg", book.CoverImageUrl);
        Assert.Equal("A test description", book.Description);
        Assert.NotNull(book.Genres);
        Assert.Contains("Programming", book.Genres!);
        Assert.Equal(2020, book.PublicationYear);
    }

    // ── Helpers ─────────────────────────────────────────────────

    private async Task<(HttpClient Client, string UserId)> CreateAuthenticatedClient()
    {
        var client = _appFactory.CreateClient();
        var email = $"search-test-{Guid.NewGuid():N}@test.local";

        var regResp = await client.PostAsJsonAsync("/api/auth/register",
            new { email, password = StrongPassword });
        var regBody = await regResp.Content.ReadFromJsonAsync<AuthResponse>(JsonOpts);

        client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", regBody!.Token);

        return (client, regBody.UserId);
    }

    // ── Custom WebApplicationFactory ────────────────────────────

    public class SearchTestApp : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Development");

            builder.ConfigureServices(services =>
            {
                // Swap SQL Server for in-memory EF Core
                var descriptorsToRemove = services
                    .Where(d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>))
                    .ToList();
                foreach (var d in descriptorsToRemove)
                    services.Remove(d);

                var dbName = $"BookTracker_SearchTests_{Guid.NewGuid():N}";
                services.AddDbContext<ApplicationDbContext>(opts =>
                    opts.UseInMemoryDatabase(dbName));

                // Replace IBookSearchService with a mock
                var searchDescriptor = services
                    .FirstOrDefault(d => d.ServiceType == typeof(IBookSearchService));
                if (searchDescriptor is not null)
                    services.Remove(searchDescriptor);

                var mockSearchService = Substitute.For<IBookSearchService>();
                mockSearchService.SearchBooksAsync(Arg.Any<string>(), Arg.Any<int>())
                    .Returns(Task.FromResult(new List<BookSearchResult>
                    {
                        new()
                        {
                            ExternalId = "ext-1",
                            Title = "Test Book",
                            Author = "Test Author",
                            Isbn = "978-0000000000",
                            CoverImageUrl = "https://img.test.com/cover.jpg",
                            Description = "A test description",
                            Genres = new[] { "Programming", "Software" },
                            PublicationYear = 2020,
                            Source = "google-books",
                        }
                    }));

                services.AddSingleton(mockSearchService);
            });
        }
    }
}
