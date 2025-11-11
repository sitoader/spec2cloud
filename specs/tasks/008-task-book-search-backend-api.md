# Task 008: Book Search and Discovery Backend API

**Feature**: Book Search & Discovery (FRD-002)  
**Dependencies**: Task 001 (Backend Scaffolding), Task 004 (Auth Backend)  
**Estimated Complexity**: Medium

---

## Description

Implement backend API for searching external book databases (Google Books API, Open Library) and returning book metadata to frontend.

---

## Technical Requirements

### External API Integration

Configure HTTP clients for:
- **Google Books API**: `https://www.googleapis.com/books/v1/volumes?q={query}`
- **Open Library API**: `https://openlibrary.org/search.json?q={query}`

Use `IHttpClientFactory` to create named clients.

### DTOs

Create in `BookTracker.Api/Models/Search/`:

```csharp
public record SearchBooksRequest
{
    [Required, MinLength(3)]
    public required string Query { get; init; }
    
    public int MaxResults { get; init; } = 20;
}

public record ExternalBookDto
{
    public string? ExternalId { get; init; }
    public required string Title { get; init; }
    public required string Author { get; init; }
    public string? Isbn { get; init; }
    public string? CoverImageUrl { get; init; }
    public string? Description { get; init; }
    public string[]? Genres { get; init; }
    public int? PublicationYear { get; init; }
    public required string Source { get; init; } // "google-books" or "open-library"
}
```

### API Endpoints

#### **GET /api/search/books?query={query}**
- Requires authentication
- Validates query length (min 3 characters)
- Searches Google Books API first
- Falls back to Open Library if Google Books fails
- Returns max 20 results
- Maps external data to ExternalBookDto
- Returns 200 OK with ExternalBookDto[]
- Returns 400 if query too short
- Returns 503 if both APIs unavailable

### Service Layer

Create `IBookSearchService` and `BookSearchService`:

**Methods**:
- `SearchBooksAsync(query, maxResults)`: Search external APIs
- `SearchGoogleBooksAsync(query)`: Google Books specific
- `SearchOpenLibraryAsync(query)`: Open Library specific
- `MapGoogleBooksResponse(response)`: Convert to ExternalBookDto
- `MapOpenLibraryResponse(response)`: Convert to ExternalBookDto

### Response Mapping

Google Books API response mapping:
- `volumeInfo.title` → Title
- `volumeInfo.authors[0]` → Author
- `volumeInfo.industryIdentifiers[].identifier` → Isbn
- `volumeInfo.imageLinks.thumbnail` → CoverImageUrl
- `volumeInfo.description` → Description
- `volumeInfo.categories` → Genres
- `volumeInfo.publishedDate` → PublicationYear

Open Library API response mapping:
- `title` → Title
- `author_name[0]` → Author
- `isbn[0]` → Isbn
- `cover_i` → CoverImageUrl (construct URL)
- `first_sentence` → Description
- `subject` → Genres
- `first_publish_year` → PublicationYear

### Error Handling

- Handle API timeouts (5-second timeout)
- Handle rate limiting (429 responses)
- Handle network failures
- Log errors to Application Insights
- Fall back to secondary API
- Return empty results if all APIs fail (don't throw)

### Caching

Implement response caching:
- Cache successful searches for 24 hours
- Use in-memory cache or distributed cache
- Cache key: hash of query string
- Reduce API calls and improve performance

---

## Acceptance Criteria

### Search Endpoint
- [ ] GET /api/search/books returns results for valid query
- [ ] Minimum query length is 3 characters
- [ ] Returns max 20 results
- [ ] Results include title, author, cover URL, description
- [ ] Results mapped correctly from external APIs
- [ ] Returns 400 for queries < 3 characters
- [ ] Returns empty array if no results found
- [ ] Returns 503 if all APIs unavailable

### Google Books Integration
- [ ] Searches Google Books API
- [ ] Maps response correctly to ExternalBookDto
- [ ] Handles missing fields gracefully
- [ ] Extracts ISBN from industryIdentifiers

### Open Library Integration
- [ ] Searches Open Library API as fallback
- [ ] Maps response correctly to ExternalBookDto
- [ ] Constructs cover image URL from cover_i

### Error Handling
- [ ] Handles API timeouts without throwing
- [ ] Falls back to Open Library if Google Books fails
- [ ] Returns empty array if both APIs fail
- [ ] Logs errors to Application Insights
- [ ] Handles rate limiting gracefully

### Caching
- [ ] Successful searches cached for 24 hours
- [ ] Subsequent identical queries return cached results
- [ ] Cache improves response time

---

## Testing Requirements

### Unit Tests (≥85% coverage)

**Test Cases**:

1. **BookSearchService**:
   - SearchGoogleBooksAsync parses response correctly
   - SearchOpenLibraryAsync parses response correctly
   - Handles missing fields in API responses
   - Falls back to secondary API on failure
   - Returns empty results when all APIs fail
   
2. **Response Mapping**:
   - Google Books response maps all fields correctly
   - Open Library response maps all fields correctly
   - Missing ISBN handled gracefully
   - Missing cover image returns null

### Integration Tests

**Test Cases**:

1. **Search Endpoint**:
   - GET /api/search/books returns results (use mock HTTP client)
   - Short query returns 400
   - API failure returns 503 or empty array
   - Results limited to 20
   
2. **External API Integration** (optional, can be mocked):
   - Real call to Google Books API returns results
   - Real call to Open Library API returns results
   - Parse actual API responses correctly

---

## Definition of Done

- [ ] Search endpoint implemented
- [ ] Google Books integration works
- [ ] Open Library fallback works
- [ ] All unit tests pass with ≥85% coverage
- [ ] All integration tests pass
- [ ] Response mapping correct
- [ ] Error handling robust
- [ ] Caching implemented
- [ ] Code reviewed and approved
