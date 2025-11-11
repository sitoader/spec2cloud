# Task 006: Book Library Management Backend API

**Feature**: Book Library Management (FRD-001)  
**Dependencies**: Task 001 (Backend Scaffolding), Task 003 (Database Schema), Task 004 (Auth Backend)  
**Estimated Complexity**: High

---

## Description

Implement REST API endpoints for managing user's personal book library including adding, viewing, updating, and deleting books.

---

## Technical Requirements

### DTOs

Create in `BookTracker.Api/Models/Books/`:

```csharp
public record AddBookRequest
{
    [Required, MaxLength(500)]
    public required string Title { get; init; }
    
    [Required, MaxLength(200)]
    public required string Author { get; init; }
    
    [MaxLength(20)]
    public string? Isbn { get; init; }
    
    [MaxLength(500)]
    public string? CoverImageUrl { get; init; }
    
    [MaxLength(2000)]
    public string? Description { get; init; }
    
    public string[]? Genres { get; init; }
    
    public DateTime? PublicationDate { get; init; }
    
    [Required]
    public BookStatus Status { get; init; }
    
    public string? Source { get; init; }
}

public record UpdateBookRequest
{
    public string? Title { get; init; }
    public string? Author { get; init; }
    public BookStatus? Status { get; init; }
    // Other updatable fields...
}

public record BookDto
{
    public required Guid Id { get; init; }
    public required string Title { get; init; }
    public required string Author { get; init; }
    public string? Isbn { get; init; }
    public string? CoverImageUrl { get; init; }
    public string? Description { get; init; }
    public string[]? Genres { get; init; }
    public DateTime? PublicationDate { get; init; }
    public required BookStatus Status { get; init; }
    public required DateTime AddedDate { get; init; }
    public string? Source { get; init; }
    public RatingDto? Rating { get; init; }
}
```

### API Endpoints

#### **GET /api/books**
- Requires authentication
- Query parameters: status (optional), page, pageSize
- Returns paginated list of user's books
- Includes rating information if exists
- Filters by status (Read, TBR, all)
- Sorts by addedDate descending
- Returns 200 OK with BookDto[]

#### **GET /api/books/{id}**
- Requires authentication
- Validates book belongs to user
- Returns single book with full details
- Returns 200 OK with BookDto
- Returns 404 if not found or not owned by user

#### **POST /api/books**
- Requires authentication
- Accepts AddBookRequest
- Validates required fields
- Checks for duplicate (userId + title)
- Creates book record
- Returns 201 Created with location header
- Returns 400 for validation errors, 409 for duplicate

#### **PUT /api/books/{id}**
- Requires authentication
- Validates book belongs to user
- Updates only provided fields (partial update)
- Returns 200 OK with updated BookDto
- Returns 404 if not found, 403 if not owned

#### **DELETE /api/books/{id}**
- Requires authentication
- Validates book belongs to user
- Deletes book and cascades to rating
- Returns 204 No Content
- Returns 404 if not found, 403 if not owned

#### **PATCH /api/books/{id}/status**
- Requires authentication
- Updates only book status
- Request body: `{ "status": "Completed" }`
- Returns 200 OK with BookDto
- Returns 404 if not found

### Service Layer

Create `IBookService` and `BookService` in `BookTracker.Core/Services/`:

**Methods**:
- `GetUserBooksAsync(userId, status?, page, pageSize)`: Retrieve paginated books
- `GetBookByIdAsync(userId, bookId)`: Get single book
- `AddBookAsync(userId, request)`: Create new book
- `UpdateBookAsync(userId, bookId, request)`: Update book
- `UpdateBookStatusAsync(userId, bookId, status)`: Change status
- `DeleteBookAsync(userId, bookId)`: Remove book
- `CheckDuplicateAsync(userId, title)`: Duplicate detection

### Repository Pattern

Create `IBookRepository` and `BookRepository` in `BookTracker.Infrastructure/Repositories/`:

**Methods**:
- `GetByUserIdAsync(userId, status?, skip, take)`: EF query with filtering, paging
- `GetByIdAsync(userId, bookId)`: Single book query
- `AddAsync(book)`: Insert book
- `UpdateAsync(book)`: Update book
- `DeleteAsync(bookId)`: Remove book
- `ExistsAsync(userId, title)`: Duplicate check

Use EF Core with:
- AsNoTracking for read queries
- Include navigation properties (Rating)
- Proper indexing for performance

### Validation

- Required fields: title, author, status
- Title max 500 characters
- Author max 200 characters
- ISBN max 20 characters
- Description max 2000 characters
- Duplicate detection on (userId, title) case-insensitive
- Ownership validation (user can only access their books)

---

## Acceptance Criteria

### GET /api/books
- [ ] Returns all books for authenticated user
- [ ] Filters by status when provided
- [ ] Paginates results correctly
- [ ] Includes rating data if exists
- [ ] Returns empty array for user with no books
- [ ] Returns 401 if not authenticated
- [ ] Loads within 2 seconds for 500 books

### GET /api/books/{id}
- [ ] Returns book details including rating
- [ ] Returns 404 for non-existent book
- [ ] Returns 403 if book belongs to different user
- [ ] Returns 401 if not authenticated

### POST /api/books
- [ ] Creates book with all provided fields
- [ ] Returns 201 with location header and BookDto
- [ ] Validates required fields
- [ ] Returns 400 for invalid data
- [ ] Returns 409 for duplicate title (same user)
- [ ] Stores genres as JSON array
- [ ] Sets addedDate to current UTC time

### PUT /api/books/{id}
- [ ] Updates specified fields only
- [ ] Returns updated BookDto
- [ ] Returns 404 for non-existent book
- [ ] Returns 403 if book belongs to different user
- [ ] Validates updated fields

### PATCH /api/books/{id}/status
- [ ] Updates only status field
- [ ] Returns updated BookDto
- [ ] Allows transitioning between all statuses
- [ ] Returns 404 for non-existent book

### DELETE /api/books/{id}
- [ ] Deletes book and cascades to rating
- [ ] Returns 204 No Content
- [ ] Returns 404 for non-existent book
- [ ] Returns 403 if book belongs to different user
- [ ] Book no longer queryable after deletion

### Data Integrity
- [ ] All queries filter by userId (prevent cross-user access)
- [ ] Duplicate title detection works case-insensitively
- [ ] Cascade delete removes rating when book deleted
- [ ] Genres stored and retrieved as array correctly

---

## Testing Requirements

### Unit Tests (≥85% coverage)

**Test Cases**:

1. **BookService**:
   - GetUserBooksAsync returns only user's books
   - GetBookByIdAsync throws if book belongs to different user
   - AddBookAsync checks for duplicates
   - UpdateBookAsync validates ownership
   - DeleteBookAsync cascades to rating
   
2. **Validation**:
   - Required fields enforced
   - Max length constraints respected
   - Status enum values validated

### Integration Tests

**Test Cases**:

1. **Book CRUD**:
   - Create book → Read → Update → Delete lifecycle works
   - User A cannot access User B's books
   - Duplicate title detection works
   - Pagination returns correct subset
   - Status filter works correctly
   - Deleting book removes rating

2. **Performance**:
   - GET /api/books with 500 books returns in <2s
   - Queries use indexes (verify execution plan)

---

## Definition of Done

- [ ] All endpoints implemented and documented
- [ ] All unit tests pass with ≥85% coverage
- [ ] All integration tests pass
- [ ] Swagger documentation complete
- [ ] User isolation enforced (no cross-user access)
- [ ] Duplicate detection works
- [ ] Cascade deletes function correctly
- [ ] Code reviewed and approved
