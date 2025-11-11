# Task 012: AI Recommendations Backend - Azure OpenAI Integration

**Feature**: AI-Powered Recommendations (FRD-004)  
**Dependencies**: Task 001 (Backend Scaffolding), Task 006 (Book Library Backend), Task 010 (Preferences/Ratings Backend)  
**Estimated Complexity**: High

---

## Description

Implement AI-powered book recommendations using Azure OpenAI GPT-4o. Generate personalized recommendations based on user's reading history, ratings, and preferences.

---

## Technical Requirements

### Azure OpenAI Configuration

Configure in `appsettings.json`:
```json
{
  "AzureOpenAI": {
    "Endpoint": "https://{resource}.openai.azure.com/",
    "DeploymentName": "gpt-4o",
    "ApiKey": "{stored-in-key-vault}",
    "MaxTokens": 1000,
    "Temperature": 0.7
  }
}
```

Install NuGet package:
- `Azure.AI.OpenAI` (latest)

### DTOs

Create in `BookTracker.Api/Models/Recommendations/`:

```csharp
public record GenerateRecommendationsRequest
{
    public int Count { get; init; } = 5;
}

public record BookRecommendationDto
{
    public required string Title { get; init; }
    public required string Author { get; init; }
    public string? Genre { get; init; }
    public required string Reason { get; init; } // Why recommended
    public int ConfidenceScore { get; init; } // 1-5
}

public record RecommendationsResponse
{
    public required List<BookRecommendationDto> Recommendations { get; init; }
    public required DateTime GeneratedAt { get; init; }
    public required int BooksAnalyzed { get; init; }
}
```

### API Endpoints

#### **POST /api/recommendations/generate**
- Requires authentication
- Validates user has minimum 3 rated books
- Retrieves user's reading history, ratings, preferences
- Calls Azure OpenAI to generate recommendations
- Caches result for 24 hours
- Returns 200 OK with RecommendationsResponse
- Returns 400 if insufficient data (<3 rated books)
- Returns 503 if Azure OpenAI unavailable

### Prompt Engineering

Create system message:
```
You are a book recommendation expert. Analyze the user's reading history and generate personalized recommendations.

Rules:
- Recommend exactly {count} books
- Match user's preferred genres and themes
- Avoid books already in user's library
- Provide specific reason for each recommendation
- Format output as JSON array with title, author, genre, reason, confidenceScore (1-5)
```

Create user message from:
- Recent read books (last 20, prioritize highly rated)
- Ratings and notes
- Preferred genres, themes, authors
- Disliked books (low ratings)

Example prompt:
```
Based on my reading history:
- Loved "Project Hail Mary" by Andy Weir (5 stars) - enjoyed humor and hard sci-fi
- Enjoyed "The Martian" by Andy Weir (4 stars)
- Disliked "Book X" (1 star)

Preferred genres: Science Fiction, Fantasy
Favorite themes: space exploration, problem-solving

Recommend 5 books I'll love. Format as JSON.
```

### Service Layer

Create `IRecommendationService` and implementation:

**Methods**:
- `GenerateRecommendationsAsync(userId, count)`: Main generation logic
- `ValidateUserDataAsync(userId)`: Check minimum 3 rated books
- `BuildPromptAsync(userId)`: Construct AI prompt from user data
- `CallAzureOpenAIAsync(prompt)`: Make API call
- `ParseRecommendationsAsync(response)`: Extract JSON from AI response

### Caching

Implement caching layer:
- Cache key: `recommendations:{userId}:{date}`
- Cache duration: 24 hours
- Use `IDistributedCache` (in-memory for dev, Redis for production)
- Clear cache when user rates new books (optional)

### Rate Limiting

Implement rate limiting:
- Max 10 requests per user per day
- Store count in cache with daily expiration
- Return 429 Too Many Requests if limit exceeded
- Include retry-after header

### Error Handling

- Handle Azure OpenAI timeout (>10 seconds)
- Handle API errors (401, 429, 500)
- Handle JSON parsing errors
- Handle insufficient user data
- Log all errors to Application Insights

### Cost Tracking

Log token usage:
- Prompt tokens
- Completion tokens
- Total cost calculation
- Track in Application Insights metrics

---

## Acceptance Criteria

### Validation
- [ ] Endpoint requires authentication
- [ ] Validates user has ≥3 rated books
- [ ] Returns 400 if insufficient data
- [ ] Validates request parameters

### Prompt Construction
- [ ] Includes recent read books (prioritize high ratings)
- [ ] Includes user ratings and notes
- [ ] Includes preferences (genres, themes, authors)
- [ ] Excludes books already in library
- [ ] Prompt is well-structured and clear

### Azure OpenAI Integration
- [ ] Calls Azure OpenAI API successfully
- [ ] Sends system and user messages
- [ ] Configures temperature and max tokens
- [ ] Handles API timeout (>10 seconds)
- [ ] Handles API errors gracefully

### Response Parsing
- [ ] Extracts JSON from AI response
- [ ] Maps to BookRecommendationDto
- [ ] Validates required fields (title, author, reason)
- [ ] Handles malformed JSON responses

### Caching
- [ ] Successful responses cached for 24 hours
- [ ] Subsequent requests within 24 hours return cached results
- [ ] Cache key unique per user
- [ ] Cache improves performance and reduces costs

### Rate Limiting
- [ ] Tracks requests per user per day
- [ ] Blocks requests after 10 per day
- [ ] Returns 429 status with clear message
- [ ] Resets daily counter at midnight UTC

### Cost Tracking
- [ ] Logs prompt tokens used
- [ ] Logs completion tokens used
- [ ] Calculates estimated cost
- [ ] Tracks in Application Insights

---

## Testing Requirements

### Unit Tests (≥85% coverage)

**Test Cases**:

1. **RecommendationService**:
   - ValidateUserDataAsync requires ≥3 rated books
   - BuildPromptAsync constructs correct prompt
   - ParseRecommendationsAsync extracts JSON correctly
   - Handles parsing errors gracefully
   
2. **Prompt Construction**:
   - Includes highly rated books
   - Includes preferences
   - Excludes books in library
   - Prompt length within limits

### Integration Tests

**Test Cases**:

1. **Generate Recommendations Endpoint**:
   - POST /api/recommendations/generate returns recommendations (mock Azure OpenAI)
   - Returns 400 if user has <3 rated books
   - Returns 429 if rate limit exceeded
   - Caches results for 24 hours
   - Returns cached results on subsequent calls
   
2. **Azure OpenAI Integration** (optional, can use mock):
   - Real API call returns valid JSON
   - Parses actual AI response correctly

---

## Definition of Done

- [ ] Azure OpenAI client configured
- [ ] All endpoints implemented
- [ ] All unit tests pass with ≥85% coverage
- [ ] All integration tests pass
- [ ] Prompt engineering tested with real API
- [ ] Caching works correctly
- [ ] Rate limiting enforced
- [ ] Token usage logged
- [ ] Error handling robust
- [ ] Code reviewed and approved
