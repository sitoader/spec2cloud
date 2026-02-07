using System.Text.Json;
using BookTracker.Core.Entities;
using BookTracker.Core.Repositories;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace BookTracker.Core.Services;

/// <summary>
/// Generates AI-powered book recommendations using user reading history and preferences.
/// </summary>
public class RecommendationService : IRecommendationService
{
    private readonly IBookRepository _bookRepo;
    private readonly IPreferencesService _preferencesService;
    private readonly IAiChatClient _aiClient;
    private readonly IMemoryCache _cache;
    private readonly ILogger<RecommendationService> _logger;

    private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(24);
    private const int MaxRateLimitPerDay = 10;
    private const int MinRatedBooks = 3;
    private const int MaxBooksForPrompt = 20;

    public RecommendationService(
        IBookRepository bookRepo,
        IPreferencesService preferencesService,
        IAiChatClient aiClient,
        IMemoryCache cache,
        ILogger<RecommendationService> logger)
    {
        _bookRepo = bookRepo;
        _preferencesService = preferencesService;
        _aiClient = aiClient;
        _cache = cache;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<bool> ValidateUserDataAsync(string userId)
    {
        var (books, _) = await _bookRepo.GetByUserIdAsync(userId, null, 0, 1000);
        var ratedCount = books.Count(b => b.Rating is not null);
        return ratedCount >= MinRatedBooks;
    }

    /// <inheritdoc />
    public async Task<RecommendationGenerationResult> GenerateRecommendationsAsync(string userId, int count)
    {
        // Check cache first
        var cacheKey = $"recommendations:{userId}:{DateTime.UtcNow:yyyy-MM-dd}";
        if (_cache.TryGetValue(cacheKey, out RecommendationGenerationResult? cached) && cached is not null)
        {
            _logger.LogInformation("Returning cached recommendations for user {UserId}", userId);
            return cached;
        }

        // Check rate limit
        var rateLimitKey = $"ratelimit:recommendations:{userId}:{DateTime.UtcNow:yyyy-MM-dd}";
        var currentCount = _cache.TryGetValue(rateLimitKey, out int count_) ? count_ : 0;
        if (currentCount >= MaxRateLimitPerDay)
        {
            throw new RateLimitExceededException();
        }

        // Get user's books with ratings
        var (books, _) = await _bookRepo.GetByUserIdAsync(userId, null, 0, 1000);

        var ratedBooks = books
            .Where(b => b.Rating is not null)
            .OrderByDescending(b => b.Rating!.Score)
            .ThenByDescending(b => b.Rating!.RatedDate)
            .Take(MaxBooksForPrompt)
            .ToList();

        if (ratedBooks.Count < MinRatedBooks)
        {
            throw new InsufficientDataException("You need at least 3 rated books to generate recommendations.");
        }

        // Get preferences
        var preferences = await _preferencesService.GetUserPreferencesAsync(userId);

        // Build prompt
        var (systemMessage, userMessage) = BuildPrompt(ratedBooks, books, preferences, count);

        // Call AI
        var aiResponse = await _aiClient.GetCompletionAsync(systemMessage, userMessage, 0.7f, 1000);

        _logger.LogInformation(
            "Azure OpenAI usage for user {UserId}: PromptTokens={PromptTokens}, CompletionTokens={CompletionTokens}",
            userId, aiResponse.PromptTokens, aiResponse.CompletionTokens);

        // Parse recommendations
        var recommendations = ParseRecommendations(aiResponse.Content);

        var result = new RecommendationGenerationResult
        {
            Recommendations = recommendations,
            GeneratedAt = DateTime.UtcNow,
            BooksAnalyzed = ratedBooks.Count,
        };

        // Cache the result
        _cache.Set(cacheKey, result, CacheDuration);

        // Increment rate limit
        var midnight = DateTime.UtcNow.Date.AddDays(1) - DateTime.UtcNow;
        _cache.Set(rateLimitKey, currentCount + 1, midnight);

        return result;
    }

    public static (string SystemMessage, string UserMessage) BuildPrompt(
        List<Book> ratedBooks,
        List<Book> allBooks,
        UserPreferences preferences,
        int count)
    {
        var systemMessage = $"""
            You are a book recommendation expert. Analyze the user's reading history and generate personalized recommendations.

            Rules:
            - Recommend exactly {count} books
            - Match user's preferred genres and themes
            - Avoid books already in user's library
            - Provide specific reason for each recommendation
            - Format output as JSON array with title, author, genre, reason, confidenceScore (1-5)
            """;

        var userParts = new List<string>();

        // Add rated books
        userParts.Add("Based on my reading history:");
        foreach (var book in ratedBooks)
        {
            var stars = book.Rating!.Score;
            var label = stars >= 4 ? "Loved" : stars >= 3 ? "Enjoyed" : "Disliked";
            var line = $"- {label} \"{book.Title}\" by {book.Author} ({stars} stars)";
            if (!string.IsNullOrWhiteSpace(book.Rating.Notes))
            {
                line += $" - {book.Rating.Notes}";
            }
            userParts.Add(line);
        }

        // Add preferences
        var genres = DeserializeArray(preferences.PreferredGenres);
        var themes = DeserializeArray(preferences.PreferredThemes);
        var authors = DeserializeArray(preferences.FavoriteAuthors);

        if (genres.Length > 0)
            userParts.Add($"\nPreferred genres: {string.Join(", ", genres)}");
        if (themes.Length > 0)
            userParts.Add($"Favorite themes: {string.Join(", ", themes)}");
        if (authors.Length > 0)
            userParts.Add($"Favorite authors: {string.Join(", ", authors)}");

        // Add exclusions
        var existingTitles = allBooks.Select(b => b.Title).ToList();
        if (existingTitles.Count > 0)
        {
            userParts.Add($"\nDo NOT recommend any of these books I already have: {string.Join(", ", existingTitles.Take(50).Select(t => $"\"{t}\""))}");
        }

        userParts.Add($"\nRecommend {count} books I'll love. Format as JSON array.");

        var userMessage = string.Join("\n", userParts);

        return (systemMessage, userMessage);
    }

    public static List<RecommendationResult> ParseRecommendations(string aiContent)
    {
        // Extract JSON array from the response (AI may wrap it in markdown code blocks)
        var json = aiContent.Trim();

        // Remove markdown code fences if present
        if (json.Contains("```"))
        {
            var startIdx = json.IndexOf('[');
            var endIdx = json.LastIndexOf(']');
            if (startIdx >= 0 && endIdx > startIdx)
            {
                json = json[startIdx..(endIdx + 1)];
            }
        }

        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
        };

        var items = JsonSerializer.Deserialize<List<JsonRecommendation>>(json, options)
            ?? throw new JsonException("Failed to parse recommendations JSON.");

        return items
            .Where(i => !string.IsNullOrWhiteSpace(i.Title) && !string.IsNullOrWhiteSpace(i.Author))
            .Select(i => new RecommendationResult
            {
                Title = i.Title!,
                Author = i.Author!,
                Genre = i.Genre,
                Reason = i.Reason ?? "Recommended based on your reading history.",
                ConfidenceScore = Math.Clamp(i.ConfidenceScore, 1, 5),
            })
            .ToList();
    }

    private static string[] DeserializeArray(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return Array.Empty<string>();

        try
        {
            return JsonSerializer.Deserialize<string[]>(json) ?? Array.Empty<string>();
        }
        catch (JsonException)
        {
            return Array.Empty<string>();
        }
    }

    /// <summary>Internal DTO for deserializing AI JSON output.</summary>
    private sealed class JsonRecommendation
    {
        public string? Title { get; set; }
        public string? Author { get; set; }
        public string? Genre { get; set; }
        public string? Reason { get; set; }
        public int ConfidenceScore { get; set; }
    }
}

/// <summary>Thrown when a user exceeds the daily recommendation request limit.</summary>
public class RateLimitExceededException : Exception
{
    public RateLimitExceededException()
        : base("Rate limit exceeded. Maximum 10 recommendation requests per day.") { }
}

/// <summary>Thrown when a user does not have enough data for recommendation generation.</summary>
public class InsufficientDataException : Exception
{
    public InsufficientDataException(string message) : base(message) { }
}
