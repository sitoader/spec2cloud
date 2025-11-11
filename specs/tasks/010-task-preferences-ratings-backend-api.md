# Task 010: User Preferences and Ratings Backend API

**Feature**: User Preferences & Ratings (FRD-003)  
**Dependencies**: Task 001 (Backend Scaffolding), Task 003 (Database Schema), Task 006 (Book Library Backend)  
**Estimated Complexity**: Medium

---

## Description

Implement API endpoints for managing book ratings/notes and user reading preferences (genres, themes, favorite authors).

---

## Technical Requirements

### DTOs

Create in `BookTracker.Api/Models/`:

```csharp
// Ratings
public record AddRatingRequest
{
    [Required, Range(1, 5)]
    public int Score { get; init; }
    
    [MaxLength(1000)]
    public string? Notes { get; init; }
}

public record RatingDto
{
    public required Guid Id { get; init; }
    public required int Score { get; init; }
    public string? Notes { get; init; }
    public required DateTime RatedDate { get; init; }
    public DateTime? UpdatedDate { get; init; }
}

// Preferences
public record UpdatePreferencesRequest
{
    public string[]? PreferredGenres { get; init; }
    public string[]? PreferredThemes { get; init; }
    public string[]? FavoriteAuthors { get; init; }
}

public record UserPreferencesDto
{
    public required Guid Id { get; init; }
    public string[]? PreferredGenres { get; init; }
    public string[]? PreferredThemes { get; init; }
    public string[]? FavoriteAuthors { get; init; }
    public required DateTime CreatedDate { get; init; }
    public DateTime? UpdatedDate { get; init; }
}
```

### API Endpoints - Ratings

#### **POST /api/books/{bookId}/rating**
- Requires authentication
- Validates book exists and belongs to user
- Creates or updates rating
- Returns 200 OK with RatingDto
- Returns 404 if book not found

#### **PUT /api/books/{bookId}/rating**
- Requires authentication
- Updates existing rating
- Returns 200 OK with updated RatingDto
- Returns 404 if book or rating not found

#### **DELETE /api/books/{bookId}/rating**
- Requires authentication
- Deletes rating for book
- Returns 204 No Content
- Returns 404 if rating not found

### API Endpoints - Preferences

#### **GET /api/preferences**
- Requires authentication
- Returns user's reading preferences
- Returns 200 OK with UserPreferencesDto
- Creates default preferences if none exist

#### **PUT /api/preferences**
- Requires authentication
- Updates user preferences
- Returns 200 OK with updated UserPreferencesDto
- Creates preferences if none exist (upsert)

### Service Layer

Create services in `BookTracker.Core/Services/`:

**IRatingService**:
- `AddOrUpdateRatingAsync(userId, bookId, request)`: Create/update rating
- `DeleteRatingAsync(userId, bookId)`: Remove rating
- `GetBookRatingAsync(userId, bookId)`: Get rating for specific book

**IPreferencesService**:
- `GetUserPreferencesAsync(userId)`: Retrieve preferences
- `UpdatePreferencesAsync(userId, request)`: Update preferences
- `CreateDefaultPreferencesAsync(userId)`: Initialize preferences

### Data Storage

- Ratings: One-to-one with Book entity
- Preferences: One-to-one with User entity
- Store arrays as JSON strings
- Serialize/deserialize using System.Text.Json

### Validation

- Rating score: 1-5 range
- Notes: Max 1000 characters
- Genre/theme/author arrays: Max 50 items each
- Each item max 100 characters

---

## Acceptance Criteria

### Rating Endpoints
- [ ] POST /api/books/{bookId}/rating creates rating
- [ ] Upsert behavior: creates if not exists, updates if exists
- [ ] Rating score validated (1-5)
- [ ] Notes truncated if exceeds 1000 characters
- [ ] Returns 404 if book doesn't exist
- [ ] Returns 403 if book belongs to different user
- [ ] Rated date set to current UTC time
- [ ] Updated date set on updates

### Preferences Endpoints
- [ ] GET /api/preferences returns user preferences
- [ ] Creates default empty preferences if none exist
- [ ] PUT /api/preferences updates preferences
- [ ] Arrays stored as JSON strings
- [ ] Empty arrays handled correctly
- [ ] Preferences unique per user

### Data Integrity
- [ ] Rating cascade deletes with book
- [ ] Preferences cascade delete with user
- [ ] Only one rating per book
- [ ] Only one preferences record per user

---

## Testing Requirements

### Unit Tests (≥85% coverage)

**Test Cases**:

1. **RatingService**:
   - AddOrUpdateRatingAsync creates new rating
   - AddOrUpdateRatingAsync updates existing rating
   - DeleteRatingAsync removes rating
   - Validates score range
   
2. **PreferencesService**:
   - GetUserPreferencesAsync creates default if none exist
   - UpdatePreferencesAsync stores arrays correctly
   - Serializes/deserializes JSON arrays

### Integration Tests

**Test Cases**:

1. **Rating CRUD**:
   - Create rating → Read → Update → Delete works
   - Rating saved with book
   - Delete book cascades to rating
   
2. **Preferences CRUD**:
   - Get preferences creates default
   - Update preferences persists changes
   - Arrays stored and retrieved correctly

---

## Definition of Done

- [ ] All endpoints implemented
- [ ] All unit tests pass with ≥85% coverage
- [ ] All integration tests pass
- [ ] Ratings upsert correctly
- [ ] Preferences stored as JSON
- [ ] Cascade deletes work
- [ ] Code reviewed and approved
