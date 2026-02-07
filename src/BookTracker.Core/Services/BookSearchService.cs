using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace BookTracker.Core.Services;

/// <summary>
/// Searches Google Books and Open Library APIs for book metadata.
/// Falls back to Open Library if Google Books fails.
/// Caches results for 24 hours.
/// </summary>
public class BookSearchService : IBookSearchService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IMemoryCache _cache;
    private readonly ILogger<BookSearchService> _logger;

    private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(24);
    private static readonly TimeSpan RequestTimeout = TimeSpan.FromSeconds(5);
    private const int MaxGenresPerBook = 10;

    public BookSearchService(
        IHttpClientFactory httpClientFactory,
        IMemoryCache cache,
        ILogger<BookSearchService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _cache = cache;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<List<BookSearchResult>> SearchBooksAsync(string query, int maxResults = 20)
    {
        var cacheKey = BuildCacheKey(query, maxResults);

        if (_cache.TryGetValue(cacheKey, out List<BookSearchResult>? cached) && cached is not null)
        {
            _logger.LogDebug("Cache hit for search query: {Query}", query);
            return cached;
        }

        // Try Google Books first, fall back to Open Library
        var results = await SearchGoogleBooksAsync(query, maxResults);

        if (results.Count == 0)
        {
            _logger.LogInformation("Google Books returned no results or failed, falling back to Open Library for query: {Query}", query);
            results = await SearchOpenLibraryAsync(query, maxResults);
        }

        _cache.Set(cacheKey, results, CacheDuration);
        return results;
    }

    /// <summary>Searches Google Books API.</summary>
    public async Task<List<BookSearchResult>> SearchGoogleBooksAsync(string query, int maxResults = 20)
    {
        try
        {
            var client = _httpClientFactory.CreateClient("GoogleBooks");
            using var cts = new CancellationTokenSource(RequestTimeout);

            var url = $"https://www.googleapis.com/books/v1/volumes?q={Uri.EscapeDataString(query)}&maxResults={maxResults}";
            var response = await client.GetAsync(url, cts.Token);

            if ((int)response.StatusCode == 429)
            {
                _logger.LogWarning("Google Books API rate limited for query: {Query}", query);
                return new List<BookSearchResult>();
            }

            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync(cts.Token);
            return MapGoogleBooksResponse(json);
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or JsonException)
        {
            _logger.LogError(ex, "Google Books API failed for query: {Query}", query);
            return new List<BookSearchResult>();
        }
    }

    /// <summary>Searches Open Library API.</summary>
    public async Task<List<BookSearchResult>> SearchOpenLibraryAsync(string query, int maxResults = 20)
    {
        try
        {
            var client = _httpClientFactory.CreateClient("OpenLibrary");
            using var cts = new CancellationTokenSource(RequestTimeout);

            var url = $"https://openlibrary.org/search.json?q={Uri.EscapeDataString(query)}&limit={maxResults}";
            var response = await client.GetAsync(url, cts.Token);

            if ((int)response.StatusCode == 429)
            {
                _logger.LogWarning("Open Library API rate limited for query: {Query}", query);
                return new List<BookSearchResult>();
            }

            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync(cts.Token);
            return MapOpenLibraryResponse(json);
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or JsonException)
        {
            _logger.LogError(ex, "Open Library API failed for query: {Query}", query);
            return new List<BookSearchResult>();
        }
    }

    /// <summary>Maps Google Books JSON to BookSearchResult list.</summary>
    public static List<BookSearchResult> MapGoogleBooksResponse(string json)
    {
        var results = new List<BookSearchResult>();

        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        if (!root.TryGetProperty("items", out var items))
            return results;

        foreach (var item in items.EnumerateArray())
        {
            if (!item.TryGetProperty("volumeInfo", out var vol))
                continue;

            var title = vol.TryGetProperty("title", out var t) ? t.GetString() : null;
            if (string.IsNullOrWhiteSpace(title))
                continue;

            var author = "Unknown";
            if (vol.TryGetProperty("authors", out var authors) && authors.GetArrayLength() > 0)
            {
                author = authors[0].GetString() ?? "Unknown";
            }

            string? isbn = null;
            if (vol.TryGetProperty("industryIdentifiers", out var ids))
            {
                foreach (var id in ids.EnumerateArray())
                {
                    if (id.TryGetProperty("identifier", out var ident))
                    {
                        isbn = ident.GetString();
                        // Prefer ISBN_13 over ISBN_10
                        if (id.TryGetProperty("type", out var idType) && idType.GetString() == "ISBN_13")
                            break;
                    }
                }
            }

            string? coverUrl = null;
            if (vol.TryGetProperty("imageLinks", out var images) &&
                images.TryGetProperty("thumbnail", out var thumb))
            {
                coverUrl = thumb.GetString();
            }

            var description = vol.TryGetProperty("description", out var desc) ? desc.GetString() : null;

            string[]? genres = null;
            if (vol.TryGetProperty("categories", out var cats))
            {
                genres = cats.EnumerateArray()
                    .Select(c => c.GetString()!)
                    .Where(c => c is not null)
                    .ToArray();
                if (genres.Length == 0) genres = null;
            }

            int? pubYear = null;
            if (vol.TryGetProperty("publishedDate", out var pd))
            {
                var dateStr = pd.GetString();
                if (dateStr is not null && dateStr.Length >= 4 && int.TryParse(dateStr[..4], out var year))
                {
                    pubYear = year;
                }
            }

            string? externalId = null;
            if (item.TryGetProperty("id", out var idProp))
            {
                externalId = idProp.GetString();
            }

            results.Add(new BookSearchResult
            {
                ExternalId = externalId,
                Title = title!,
                Author = author,
                Isbn = isbn,
                CoverImageUrl = coverUrl,
                Description = description,
                Genres = genres,
                PublicationYear = pubYear,
                Source = "google-books",
            });
        }

        return results;
    }

    /// <summary>Maps Open Library JSON to BookSearchResult list.</summary>
    public static List<BookSearchResult> MapOpenLibraryResponse(string json)
    {
        var results = new List<BookSearchResult>();

        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        if (!root.TryGetProperty("docs", out var docs))
            return results;

        foreach (var item in docs.EnumerateArray())
        {
            var title = item.TryGetProperty("title", out var t) ? t.GetString() : null;
            if (string.IsNullOrWhiteSpace(title))
                continue;

            var author = "Unknown";
            if (item.TryGetProperty("author_name", out var authors) && authors.GetArrayLength() > 0)
            {
                author = authors[0].GetString() ?? "Unknown";
            }

            string? isbn = null;
            if (item.TryGetProperty("isbn", out var isbns) && isbns.GetArrayLength() > 0)
            {
                isbn = isbns[0].GetString();
            }

            string? coverUrl = null;
            if (item.TryGetProperty("cover_i", out var coverId))
            {
                var coverIdValue = coverId.GetInt64();
                coverUrl = $"https://covers.openlibrary.org/b/id/{coverIdValue}-M.jpg";
            }

            string? description = null;
            if (item.TryGetProperty("first_sentence", out var firstSentence))
            {
                if (firstSentence.ValueKind == JsonValueKind.Array && firstSentence.GetArrayLength() > 0)
                {
                    description = firstSentence[0].GetString();
                }
                else if (firstSentence.ValueKind == JsonValueKind.String)
                {
                    description = firstSentence.GetString();
                }
            }

            string[]? genres = null;
            if (item.TryGetProperty("subject", out var subjects))
            {
                genres = subjects.EnumerateArray()
                    .Select(s => s.GetString()!)
                    .Where(s => s is not null)
                    .Take(MaxGenresPerBook)
                    .ToArray();
                if (genres.Length == 0) genres = null;
            }

            int? pubYear = null;
            if (item.TryGetProperty("first_publish_year", out var fpy))
            {
                pubYear = fpy.GetInt32();
            }

            string? externalId = null;
            if (item.TryGetProperty("key", out var key))
            {
                externalId = key.GetString();
            }

            results.Add(new BookSearchResult
            {
                ExternalId = externalId,
                Title = title!,
                Author = author,
                Isbn = isbn,
                CoverImageUrl = coverUrl,
                Description = description,
                Genres = genres,
                PublicationYear = pubYear,
                Source = "open-library",
            });
        }

        return results;
    }

    private static string BuildCacheKey(string query, int maxResults)
    {
        var input = $"book-search:{query.ToLowerInvariant().Trim()}:{maxResults}";
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(input));
        return $"search:{Convert.ToHexString(hash)}";
    }
}
