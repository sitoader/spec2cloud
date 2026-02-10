using BookTracker.Core.Entities;
using BookTracker.Core.Repositories;
using BookTracker.Core.Services;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using NSubstitute;
using NSubstitute.ReturnsExtensions;

namespace BookTracker.Core.Tests.Services;

/// <summary>
/// Unit tests for <see cref="RecommendationService"/> covering validation,
/// prompt construction, parsing, caching, and rate limiting.
/// </summary>
public class RecommendationServiceTests
{
    private readonly IBookRepository _bookRepo;
    private readonly IPreferencesService _preferencesService;
    private readonly IAiChatClient _aiClient;
    private readonly IMemoryCache _cache;
    private readonly IBookSearchService _searchService;
    private readonly RecommendationService _svc;
    private const string UserId = "user-1";

    public RecommendationServiceTests()
    {
        _bookRepo = Substitute.For<IBookRepository>();
        _preferencesService = Substitute.For<IPreferencesService>();
        _aiClient = Substitute.For<IAiChatClient>();
        _cache = new MemoryCache(new MemoryCacheOptions());
        _searchService = Substitute.For<IBookSearchService>();
        var logger = Substitute.For<ILogger<RecommendationService>>();
        _svc = new RecommendationService(_bookRepo, _preferencesService, _aiClient, _searchService, _cache, logger);
    }

    // ── ValidateUserDataAsync ───────────────────────────────────

    [Fact]
    public async Task ValidateUserDataAsync_ReturnsFalse_WhenLessThan3RatedBooks()
    {
        var books = new List<Book>
        {
            MakeBook("Book 1", UserId, rating: 4),
            MakeBook("Book 2", UserId, rating: 5),
            MakeBook("Book 3", UserId), // no rating
        };
        _bookRepo.GetByUserIdAsync(UserId, null, 0, 1000).Returns((books, books.Count));

        var result = await _svc.ValidateUserDataAsync(UserId);

        Assert.False(result);
    }

    [Fact]
    public async Task ValidateUserDataAsync_ReturnsTrue_WhenAtLeast3RatedBooks()
    {
        var books = new List<Book>
        {
            MakeBook("Book 1", UserId, rating: 4),
            MakeBook("Book 2", UserId, rating: 5),
            MakeBook("Book 3", UserId, rating: 3),
        };
        _bookRepo.GetByUserIdAsync(UserId, null, 0, 1000).Returns((books, books.Count));

        var result = await _svc.ValidateUserDataAsync(UserId);

        Assert.True(result);
    }

    // ── BuildPrompt ─────────────────────────────────────────────

    [Fact]
    public void BuildPrompt_IncludesHighlyRatedBooks()
    {
        var ratedBooks = new List<Book>
        {
            MakeBook("Great Book", UserId, rating: 5),
            MakeBook("Good Book", UserId, rating: 4),
            MakeBook("OK Book", UserId, rating: 3),
        };
        var allBooks = ratedBooks;
        var prefs = MakePreferences(UserId);

        var (system, user) = RecommendationService.BuildPrompt(ratedBooks, allBooks, prefs, 5);

        Assert.Contains("Loved \"Great Book\"", user);
        Assert.Contains("5 stars", user);
        Assert.Contains("Loved \"Good Book\"", user);
    }

    [Fact]
    public void BuildPrompt_IncludesDislikedBooks()
    {
        var ratedBooks = new List<Book>
        {
            MakeBook("Loved Book", UserId, rating: 5),
            MakeBook("Bad Book", UserId, rating: 1),
            MakeBook("OK Book", UserId, rating: 3),
        };
        var prefs = MakePreferences(UserId);

        var (_, user) = RecommendationService.BuildPrompt(ratedBooks, ratedBooks, prefs, 5);

        Assert.Contains("Disliked \"Bad Book\"", user);
        Assert.Contains("1 stars", user);
    }

    [Fact]
    public void BuildPrompt_IncludesPreferences()
    {
        var ratedBooks = new List<Book> { MakeBook("Book", UserId, rating: 5) };
        var prefs = MakePreferences(UserId, genres: new[] { "Sci-Fi", "Fantasy" }, themes: new[] { "space" });

        var (_, user) = RecommendationService.BuildPrompt(ratedBooks, ratedBooks, prefs, 5);

        Assert.Contains("Sci-Fi", user);
        Assert.Contains("Fantasy", user);
        Assert.Contains("space", user);
    }

    [Fact]
    public void BuildPrompt_ExcludesExistingBooks()
    {
        var ratedBooks = new List<Book> { MakeBook("My Book", UserId, rating: 5) };
        var allBooks = new List<Book>
        {
            MakeBook("My Book", UserId, rating: 5),
            MakeBook("Another Book", UserId),
        };
        var prefs = MakePreferences(UserId);

        var (_, user) = RecommendationService.BuildPrompt(ratedBooks, allBooks, prefs, 5);

        Assert.Contains("Do NOT recommend", user);
        Assert.Contains("\"My Book\"", user);
        Assert.Contains("\"Another Book\"", user);
    }

    [Fact]
    public void BuildPrompt_IncludesRatingNotes()
    {
        var book = MakeBook("Noted Book", UserId, rating: 4, notes: "Amazing plot twists");
        var prefs = MakePreferences(UserId);

        var (_, user) = RecommendationService.BuildPrompt(new List<Book> { book }, new List<Book> { book }, prefs, 5);

        Assert.Contains("Amazing plot twists", user);
    }

    [Fact]
    public void BuildPrompt_SystemMessageContainsCount()
    {
        var ratedBooks = new List<Book> { MakeBook("Book", UserId, rating: 5) };
        var prefs = MakePreferences(UserId);

        var (system, _) = RecommendationService.BuildPrompt(ratedBooks, ratedBooks, prefs, 7);

        Assert.Contains("exactly 7 books", system);
    }

    // ── ParseRecommendations ────────────────────────────────────

    [Fact]
    public void ParseRecommendations_ExtractsJsonCorrectly()
    {
        var json = """
        [
            {"title": "Dune", "author": "Frank Herbert", "genre": "Sci-Fi", "reason": "Epic scope", "confidenceScore": 5},
            {"title": "Foundation", "author": "Isaac Asimov", "genre": "Sci-Fi", "reason": "Classic", "confidenceScore": 4}
        ]
        """;

        var results = RecommendationService.ParseRecommendations(json);

        Assert.Equal(2, results.Count);
        Assert.Equal("Dune", results[0].Title);
        Assert.Equal("Frank Herbert", results[0].Author);
        Assert.Equal("Sci-Fi", results[0].Genre);
        Assert.Equal("Epic scope", results[0].Reason);
        Assert.Equal(5, results[0].ConfidenceScore);
    }

    [Fact]
    public void ParseRecommendations_HandlesMarkdownCodeFences()
    {
        var aiResponse = """
        Here are your recommendations:
        ```json
        [
            {"title": "Dune", "author": "Frank Herbert", "genre": "Sci-Fi", "reason": "Great", "confidenceScore": 5}
        ]
        ```
        """;

        var results = RecommendationService.ParseRecommendations(aiResponse);

        Assert.Single(results);
        Assert.Equal("Dune", results[0].Title);
    }

    [Fact]
    public void ParseRecommendations_ClampsConfidenceScore()
    {
        var json = """
        [
            {"title": "Book A", "author": "Author A", "reason": "R", "confidenceScore": 10},
            {"title": "Book B", "author": "Author B", "reason": "R", "confidenceScore": -1}
        ]
        """;

        var results = RecommendationService.ParseRecommendations(json);

        Assert.Equal(5, results[0].ConfidenceScore);
        Assert.Equal(1, results[1].ConfidenceScore);
    }

    [Fact]
    public void ParseRecommendations_SkipsEntriesMissingRequiredFields()
    {
        var json = """
        [
            {"title": "Valid", "author": "Author", "reason": "R", "confidenceScore": 3},
            {"title": "", "author": "Author", "reason": "R", "confidenceScore": 3},
            {"title": "Valid2", "author": null, "reason": "R", "confidenceScore": 3}
        ]
        """;

        var results = RecommendationService.ParseRecommendations(json);

        Assert.Single(results);
        Assert.Equal("Valid", results[0].Title);
    }

    [Fact]
    public void ParseRecommendations_ProvidesDefaultReason_WhenMissing()
    {
        var json = """
        [
            {"title": "Book", "author": "Author", "confidenceScore": 3}
        ]
        """;

        var results = RecommendationService.ParseRecommendations(json);

        Assert.Single(results);
        Assert.Contains("reading history", results[0].Reason);
    }

    [Fact]
    public void ParseRecommendations_ThrowsOnMalformedJson()
    {
        Assert.Throws<System.Text.Json.JsonException>(() =>
            RecommendationService.ParseRecommendations("not json at all"));
    }

    // ── GenerateRecommendationsAsync ────────────────────────────

    [Fact]
    public async Task GenerateRecommendationsAsync_ThrowsInsufficientData_WhenLessThan3Rated()
    {
        var books = new List<Book>
        {
            MakeBook("Book 1", UserId, rating: 4),
            MakeBook("Book 2", UserId, rating: 5),
        };
        _bookRepo.GetByUserIdAsync(UserId, null, 0, 1000).Returns((books, books.Count));
        _preferencesService.GetUserPreferencesAsync(UserId).Returns(MakePreferences(UserId));

        await Assert.ThrowsAsync<InsufficientDataException>(
            () => _svc.GenerateRecommendationsAsync(UserId, 5));
    }

    [Fact]
    public async Task GenerateRecommendationsAsync_ReturnsRecommendations_WhenDataSufficient()
    {
        var books = new List<Book>
        {
            MakeBook("Book 1", UserId, rating: 5),
            MakeBook("Book 2", UserId, rating: 4),
            MakeBook("Book 3", UserId, rating: 3),
        };
        _bookRepo.GetByUserIdAsync(UserId, null, 0, 1000).Returns((books, books.Count));
        _preferencesService.GetUserPreferencesAsync(UserId).Returns(MakePreferences(UserId));

        var aiJson = """
        [{"title": "Rec 1", "author": "Author 1", "genre": "Sci-Fi", "reason": "Great match", "confidenceScore": 5}]
        """;
        _aiClient.GetCompletionAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<float>(), Arg.Any<int>())
            .Returns(new AiChatResponse { Content = aiJson, PromptTokens = 100, CompletionTokens = 50 });

        var result = await _svc.GenerateRecommendationsAsync(UserId, 1);

        Assert.Single(result.Recommendations);
        Assert.Equal("Rec 1", result.Recommendations[0].Title);
        Assert.Equal(3, result.BooksAnalyzed);
    }

    [Fact]
    public async Task GenerateRecommendationsAsync_ReturnsCachedResult_OnSecondCall()
    {
        var books = new List<Book>
        {
            MakeBook("Book 1", UserId, rating: 5),
            MakeBook("Book 2", UserId, rating: 4),
            MakeBook("Book 3", UserId, rating: 3),
        };
        _bookRepo.GetByUserIdAsync(UserId, null, 0, 1000).Returns((books, books.Count));
        _preferencesService.GetUserPreferencesAsync(UserId).Returns(MakePreferences(UserId));

        var aiJson = """[{"title": "Rec", "author": "A", "reason": "R", "confidenceScore": 5}]""";
        _aiClient.GetCompletionAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<float>(), Arg.Any<int>())
            .Returns(new AiChatResponse { Content = aiJson, PromptTokens = 100, CompletionTokens = 50 });

        var first = await _svc.GenerateRecommendationsAsync(UserId, 1);
        var second = await _svc.GenerateRecommendationsAsync(UserId, 1);

        // AI should only be called once; second call uses cache
        await _aiClient.Received(1).GetCompletionAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<float>(), Arg.Any<int>());
        Assert.Equal(first.GeneratedAt, second.GeneratedAt);
    }

    [Fact]
    public async Task GenerateRecommendationsAsync_ThrowsRateLimitExceeded_After10Calls()
    {
        var books = new List<Book>
        {
            MakeBook("Book 1", UserId, rating: 5),
            MakeBook("Book 2", UserId, rating: 4),
            MakeBook("Book 3", UserId, rating: 3),
        };
        _bookRepo.GetByUserIdAsync(UserId, null, 0, 1000).Returns((books, books.Count));
        _preferencesService.GetUserPreferencesAsync(UserId).Returns(MakePreferences(UserId));

        var aiJson = """[{"title": "R", "author": "A", "reason": "R", "confidenceScore": 5}]""";
        _aiClient.GetCompletionAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<float>(), Arg.Any<int>())
            .Returns(new AiChatResponse { Content = aiJson, PromptTokens = 10, CompletionTokens = 10 });

        // Simulate 10 calls by pre-setting the rate limit counter
        var rateLimitKey = $"ratelimit:recommendations:{UserId}:{DateTime.UtcNow:yyyy-MM-dd}";
        _cache.Set(rateLimitKey, 10, TimeSpan.FromHours(24));

        // Clear the recommendation cache so it doesn't short-circuit
        var cacheKey = $"recommendations:{UserId}:{DateTime.UtcNow:yyyy-MM-dd}";
        _cache.Remove(cacheKey);

        await Assert.ThrowsAsync<RateLimitExceededException>(
            () => _svc.GenerateRecommendationsAsync(UserId, 1));
    }

    // ── Helpers ──────────────────────────────────────────────────

    private static Book MakeBook(string title, string userId, int? rating = null, string? notes = null)
    {
        var book = new Book
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = title,
            Author = $"Author of {title}",
            Status = BookStatus.Completed,
            AddedDate = DateTime.UtcNow,
        };

        if (rating.HasValue)
        {
            book.Rating = new Rating
            {
                Id = Guid.NewGuid(),
                BookId = book.Id,
                Score = rating.Value,
                Notes = notes,
                RatedDate = DateTime.UtcNow,
            };
        }

        return book;
    }

    private static UserPreferences MakePreferences(
        string userId,
        string[]? genres = null,
        string[]? themes = null,
        string[]? authors = null)
    {
        return new UserPreferences
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            PreferredGenres = genres is not null ? System.Text.Json.JsonSerializer.Serialize(genres) : null,
            PreferredThemes = themes is not null ? System.Text.Json.JsonSerializer.Serialize(themes) : null,
            FavoriteAuthors = authors is not null ? System.Text.Json.JsonSerializer.Serialize(authors) : null,
            CreatedDate = DateTime.UtcNow,
        };
    }
}
