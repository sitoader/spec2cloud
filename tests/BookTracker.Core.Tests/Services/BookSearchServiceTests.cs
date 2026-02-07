using BookTracker.Core.Services;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using NSubstitute;

namespace BookTracker.Core.Tests.Services;

/// <summary>
/// Unit tests for <see cref="BookSearchService"/> covering response mapping,
/// fallback behavior, caching, and error handling.
/// </summary>
public class BookSearchServiceTests
{
    // ── MapGoogleBooksResponse ──────────────────────────────────

    [Fact]
    public void MapGoogleBooksResponse_ParsesResponseCorrectly()
    {
        var json = """
        {
          "items": [
            {
              "id": "vol1",
              "volumeInfo": {
                "title": "Clean Code",
                "authors": ["Robert C. Martin"],
                "industryIdentifiers": [
                  { "type": "ISBN_10", "identifier": "0132350882" },
                  { "type": "ISBN_13", "identifier": "9780132350884" }
                ],
                "imageLinks": { "thumbnail": "https://img.example.com/thumb.jpg" },
                "description": "A Handbook of Agile Software Craftsmanship",
                "categories": ["Computers", "Software Engineering"],
                "publishedDate": "2008-08-01"
              }
            }
          ]
        }
        """;

        var results = BookSearchService.MapGoogleBooksResponse(json);

        Assert.Single(results);
        var book = results[0];
        Assert.Equal("vol1", book.ExternalId);
        Assert.Equal("Clean Code", book.Title);
        Assert.Equal("Robert C. Martin", book.Author);
        Assert.Equal("9780132350884", book.Isbn); // Prefers ISBN_13
        Assert.Equal("https://img.example.com/thumb.jpg", book.CoverImageUrl);
        Assert.Equal("A Handbook of Agile Software Craftsmanship", book.Description);
        Assert.Equal(new[] { "Computers", "Software Engineering" }, book.Genres);
        Assert.Equal(2008, book.PublicationYear);
        Assert.Equal("google-books", book.Source);
    }

    [Fact]
    public void MapGoogleBooksResponse_HandlesEmptyItems()
    {
        var json = """{ "totalItems": 0 }""";

        var results = BookSearchService.MapGoogleBooksResponse(json);

        Assert.Empty(results);
    }

    [Fact]
    public void MapGoogleBooksResponse_HandlesMissingFields()
    {
        var json = """
        {
          "items": [
            {
              "volumeInfo": {
                "title": "Minimal Book"
              }
            }
          ]
        }
        """;

        var results = BookSearchService.MapGoogleBooksResponse(json);

        Assert.Single(results);
        var book = results[0];
        Assert.Equal("Minimal Book", book.Title);
        Assert.Equal("Unknown", book.Author);
        Assert.Null(book.Isbn);
        Assert.Null(book.CoverImageUrl);
        Assert.Null(book.Description);
        Assert.Null(book.Genres);
        Assert.Null(book.PublicationYear);
        Assert.Null(book.ExternalId);
    }

    [Fact]
    public void MapGoogleBooksResponse_SkipsItemsWithoutTitle()
    {
        var json = """
        {
          "items": [
            { "volumeInfo": {} },
            { "volumeInfo": { "title": "Valid Book" } }
          ]
        }
        """;

        var results = BookSearchService.MapGoogleBooksResponse(json);

        Assert.Single(results);
        Assert.Equal("Valid Book", results[0].Title);
    }

    [Fact]
    public void MapGoogleBooksResponse_ParsesPartialDate()
    {
        var json = """
        {
          "items": [
            {
              "volumeInfo": {
                "title": "Year Only Book",
                "publishedDate": "2020"
              }
            }
          ]
        }
        """;

        var results = BookSearchService.MapGoogleBooksResponse(json);

        Assert.Equal(2020, results[0].PublicationYear);
    }

    [Fact]
    public void MapGoogleBooksResponse_HandlesMultipleItems()
    {
        var json = """
        {
          "items": [
            { "volumeInfo": { "title": "Book One", "authors": ["Author A"] } },
            { "volumeInfo": { "title": "Book Two", "authors": ["Author B"] } },
            { "volumeInfo": { "title": "Book Three", "authors": ["Author C"] } }
          ]
        }
        """;

        var results = BookSearchService.MapGoogleBooksResponse(json);

        Assert.Equal(3, results.Count);
        Assert.Equal("Book One", results[0].Title);
        Assert.Equal("Book Two", results[1].Title);
        Assert.Equal("Book Three", results[2].Title);
    }

    // ── MapOpenLibraryResponse ──────────────────────────────────

    [Fact]
    public void MapOpenLibraryResponse_ParsesResponseCorrectly()
    {
        var json = """
        {
          "docs": [
            {
              "key": "/works/OL123W",
              "title": "The Pragmatic Programmer",
              "author_name": ["David Thomas", "Andrew Hunt"],
              "isbn": ["978-0135957059", "0135957052"],
              "cover_i": 8091016,
              "first_sentence": ["This is the first sentence."],
              "subject": ["Programming", "Software Development"],
              "first_publish_year": 1999
            }
          ]
        }
        """;

        var results = BookSearchService.MapOpenLibraryResponse(json);

        Assert.Single(results);
        var book = results[0];
        Assert.Equal("/works/OL123W", book.ExternalId);
        Assert.Equal("The Pragmatic Programmer", book.Title);
        Assert.Equal("David Thomas", book.Author);
        Assert.Equal("978-0135957059", book.Isbn);
        Assert.Equal("https://covers.openlibrary.org/b/id/8091016-M.jpg", book.CoverImageUrl);
        Assert.Equal("This is the first sentence.", book.Description);
        Assert.Equal(new[] { "Programming", "Software Development" }, book.Genres);
        Assert.Equal(1999, book.PublicationYear);
        Assert.Equal("open-library", book.Source);
    }

    [Fact]
    public void MapOpenLibraryResponse_HandlesEmptyDocs()
    {
        var json = """{ "docs": [] }""";

        var results = BookSearchService.MapOpenLibraryResponse(json);

        Assert.Empty(results);
    }

    [Fact]
    public void MapOpenLibraryResponse_HandlesMissingFields()
    {
        var json = """
        {
          "docs": [
            {
              "title": "Minimal OL Book"
            }
          ]
        }
        """;

        var results = BookSearchService.MapOpenLibraryResponse(json);

        Assert.Single(results);
        var book = results[0];
        Assert.Equal("Minimal OL Book", book.Title);
        Assert.Equal("Unknown", book.Author);
        Assert.Null(book.Isbn);
        Assert.Null(book.CoverImageUrl);
        Assert.Null(book.Description);
        Assert.Null(book.Genres);
        Assert.Null(book.PublicationYear);
    }

    [Fact]
    public void MapOpenLibraryResponse_SkipsItemsWithoutTitle()
    {
        var json = """
        {
          "docs": [
            {},
            { "title": "Has Title" }
          ]
        }
        """;

        var results = BookSearchService.MapOpenLibraryResponse(json);

        Assert.Single(results);
        Assert.Equal("Has Title", results[0].Title);
    }

    [Fact]
    public void MapOpenLibraryResponse_HandlesStringFirstSentence()
    {
        var json = """
        {
          "docs": [
            {
              "title": "String Desc Book",
              "first_sentence": "A plain string description."
            }
          ]
        }
        """;

        var results = BookSearchService.MapOpenLibraryResponse(json);

        Assert.Equal("A plain string description.", results[0].Description);
    }

    // ── SearchBooksAsync (integration with cache / fallback) ────

    [Fact]
    public async Task SearchBooksAsync_CachesResults()
    {
        var httpFactory = Substitute.For<IHttpClientFactory>();
        var cache = new MemoryCache(new MemoryCacheOptions());
        var logger = Substitute.For<ILogger<BookSearchService>>();

        // Pre-populate cache
        var cachedResults = new List<BookSearchResult>
        {
            new() { Title = "Cached Book", Author = "Cached Author", Source = "google-books" }
        };
        var input = "book-search:test query:20";
        var hash = System.Security.Cryptography.SHA256.HashData(
            System.Text.Encoding.UTF8.GetBytes(input));
        var cacheKey = $"search:{Convert.ToHexString(hash)}";
        cache.Set(cacheKey, cachedResults, TimeSpan.FromHours(24));

        var service = new BookSearchService(httpFactory, cache, logger);

        var results = await service.SearchBooksAsync("test query", 20);

        Assert.Single(results);
        Assert.Equal("Cached Book", results[0].Title);
        // HttpClientFactory should not have been called since we got a cache hit
        httpFactory.DidNotReceive().CreateClient(Arg.Any<string>());
    }

    [Fact]
    public async Task SearchBooksAsync_GoogleBooksFailure_FallsBackToOpenLibrary()
    {
        // Use a real HttpClientFactory with a mock handler
        var googleHandler = new MockHttpMessageHandler(
            new HttpResponseMessage(System.Net.HttpStatusCode.InternalServerError));
        var openLibHandler = new MockHttpMessageHandler(
            new HttpResponseMessage(System.Net.HttpStatusCode.OK)
            {
                Content = new StringContent("""
                {
                  "docs": [
                    { "title": "Fallback Book", "author_name": ["Fallback Author"] }
                  ]
                }
                """)
            });

        var httpFactory = Substitute.For<IHttpClientFactory>();
        httpFactory.CreateClient("GoogleBooks").Returns(new HttpClient(googleHandler));
        httpFactory.CreateClient("OpenLibrary").Returns(new HttpClient(openLibHandler));

        var cache = new MemoryCache(new MemoryCacheOptions());
        var logger = Substitute.For<ILogger<BookSearchService>>();
        var service = new BookSearchService(httpFactory, cache, logger);

        var results = await service.SearchBooksAsync("fallback test", 20);

        Assert.Single(results);
        Assert.Equal("Fallback Book", results[0].Title);
        Assert.Equal("open-library", results[0].Source);
    }

    [Fact]
    public async Task SearchBooksAsync_BothApisFail_ReturnsEmptyList()
    {
        var handler = new MockHttpMessageHandler(
            new HttpResponseMessage(System.Net.HttpStatusCode.InternalServerError));

        var httpFactory = Substitute.For<IHttpClientFactory>();
        httpFactory.CreateClient("GoogleBooks").Returns(new HttpClient(handler));
        httpFactory.CreateClient("OpenLibrary").Returns(new HttpClient(handler));

        var cache = new MemoryCache(new MemoryCacheOptions());
        var logger = Substitute.For<ILogger<BookSearchService>>();
        var service = new BookSearchService(httpFactory, cache, logger);

        var results = await service.SearchBooksAsync("failing test", 20);

        Assert.Empty(results);
    }

    [Fact]
    public async Task SearchBooksAsync_RateLimited_ReturnsEmptyAndFallsBack()
    {
        var googleHandler = new MockHttpMessageHandler(
            new HttpResponseMessage((System.Net.HttpStatusCode)429));
        var openLibHandler = new MockHttpMessageHandler(
            new HttpResponseMessage(System.Net.HttpStatusCode.OK)
            {
                Content = new StringContent("""
                {
                  "docs": [
                    { "title": "Rate Limited Fallback", "author_name": ["Author"] }
                  ]
                }
                """)
            });

        var httpFactory = Substitute.For<IHttpClientFactory>();
        httpFactory.CreateClient("GoogleBooks").Returns(new HttpClient(googleHandler));
        httpFactory.CreateClient("OpenLibrary").Returns(new HttpClient(openLibHandler));

        var cache = new MemoryCache(new MemoryCacheOptions());
        var logger = Substitute.For<ILogger<BookSearchService>>();
        var service = new BookSearchService(httpFactory, cache, logger);

        var results = await service.SearchBooksAsync("rate limited test", 20);

        Assert.Single(results);
        Assert.Equal("Rate Limited Fallback", results[0].Title);
    }

    // ── Mock handler ────────────────────────────────────────────

    private class MockHttpMessageHandler : HttpMessageHandler
    {
        private readonly HttpResponseMessage _response;

        public MockHttpMessageHandler(HttpResponseMessage response)
        {
            _response = response;
        }

        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request, CancellationToken cancellationToken)
        {
            return Task.FromResult(_response);
        }
    }
}
