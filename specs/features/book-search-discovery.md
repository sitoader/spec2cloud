# Feature Requirement Document (FRD): Book Search & Discovery

**Feature ID**: FRD-002  
**Feature Name**: Book Search & Discovery  
**Related PRD Requirements**: REQ-2, REQ-7, REQ-9, REQ-10  
**Status**: Draft  
**Last Updated**: November 11, 2025

---

## 1. Feature Overview

### Purpose
Enable users to discover and retrieve book information from external book databases, making it easy to add books to their library without manual data entry. Provide fallback manual entry when external search is unavailable or doesn't return results.

### Value Proposition
Users can quickly find and add books using minimal input (title or author), with rich metadata automatically populated, reducing friction in building their library.

### Success Criteria
- 80% of book searches return relevant results within 3 seconds
- Users can add a book from search results with one click
- Manual entry is available as fallback when search fails
- System handles external API failures gracefully without disrupting user flow

---

## 2. Functional Requirements

### 2.1 Search External Book Databases

**Description**: Users must be able to search for books using title, author, or ISBN from external book databases (e.g., Google Books, Open Library).

**Inputs**:
- Search query (text: title, author, or ISBN)
- Optional: search scope (title only, author only, or both)

**Outputs**:
- List of matching books with:
  - Cover image thumbnail
  - Title
  - Author(s)
  - Publication year
  - Brief description (first 100-200 characters)
- Result count
- Actions per book: "Add to Read", "Add to TBR", "View Details"

**Acceptance Criteria**:
- Search executes as user types (debounced by 500ms) or on Enter key
- Minimum query length: 3 characters
- Results display within 3 seconds
- Up to 20 results shown per search
- Results sorted by relevance (as provided by external API)
- Each result shows enough information for user to identify correct book
- Clear indication when search is in progress (loading spinner)
- Search box is easily accessible from library view

**Edge Cases**:
- What if query is too short (<3 characters)? → Display message: "Type at least 3 characters to search"
- What if search returns no results? → Display: "No books found for '[query]'. Try a different search or add manually."
- What if API returns partial data? → Display what's available, mark missing fields as "Not available"
- What if user searches very common term (e.g., "The")? → Show results, allow user to refine search

---

### 2.2 View Book Details from Search Results

**Description**: Users must be able to view comprehensive details about a book from search results before adding it to their library.

**Inputs**:
- Selected book from search results

**Outputs**:
- Detailed view showing:
  - Cover image (larger)
  - Full title
  - Author(s)
  - Publication date
  - Full description/synopsis
  - Genre(s) if available
  - Page count if available
  - ISBN if available
- Actions: "Add to Read", "Add to TBR", "Close"

**Acceptance Criteria**:
- User can access detail view by clicking on book in search results
- Detail view opens as modal or side panel (doesn't navigate away from search)
- All available metadata from external API is displayed
- Missing fields show "Not available" rather than being blank
- User can add book directly from detail view
- User can close detail view and return to search results

**Edge Cases**:
- What if cover image is missing? → Display placeholder image with book title
- What if description is extremely long? → Truncate with "Read more" expansion
- What if author information is complex (multiple authors, editors)? → Display all, comma-separated

---

### 2.3 Add Book from Search Results

**Description**: Users must be able to add a book from search results directly to their library with chosen status (Read or TBR).

**Inputs**:
- Selected book from search results
- Chosen status: Read or TBR

**Outputs**:
- Book added to user's library with all metadata from search
- Confirmation message
- Option to add another book or return to library

**Acceptance Criteria**:
- Each search result has "Add to Read" and "Add to TBR" buttons
- Book is added immediately when button clicked
- All metadata from search result is saved with book
- Confirmation displays: "'[Book Title]' added to [Read/TBR]"
- User can continue searching after adding book
- Source is tracked (e.g., "google-books", "open-library")

**Edge Cases**:
- What if book already exists in library? → Display warning: "'[Book Title]' is already in your library. View it?"
- What if adding fails due to network error? → Display error, allow retry
- What if required metadata is missing? → Prompt user to provide missing info (especially title/author)

---

### 2.4 Manual Book Entry

**Description**: Users must be able to manually add book information when external search is unavailable or doesn't return the desired book.

**Inputs**:
- Required: Title, Author
- Optional: Description, Genre, Publication date, Cover image URL

**Outputs**:
- Book added to library with user-provided metadata
- Book marked as manually entered (source: "manual")
- Confirmation message

**Acceptance Criteria**:
- "Add Manually" option is clearly visible when search returns no results
- "Add Manually" button also available from search interface at all times
- Form includes fields for: Title (required), Author (required), Description, Genre, Publication Date, Cover Image URL
- Form validation ensures required fields are filled
- User can cancel manual entry and return to search
- After submission, book appears in library immediately
- Confirmation: "'[Book Title]' added manually to [Read/TBR]"

**Edge Cases**:
- What if user doesn't provide cover image URL? → Use generic placeholder
- What if provided cover URL is invalid/broken? → Detect and fall back to placeholder
- What if user enters very long text in description? → Allow but don't enforce limit (UI should handle gracefully)

---

### 2.5 Handle External API Failures

**Description**: System must gracefully handle situations where external book databases are unavailable, rate-limited, or returning errors.

**Inputs**:
- Search query
- API response (success, error, timeout)

**Outputs**:
- Appropriate user messaging based on error type
- Fallback to manual entry option
- No application crash or broken state

**Acceptance Criteria**:
- If API is unreachable: Display "Book search is temporarily unavailable. You can add books manually."
- If API times out (>5 seconds): Display "Search is taking longer than expected. Please try again or add manually."
- If API returns error: Display "Unable to search books right now. Please try again later or add manually."
- Manual entry option is always available regardless of API state
- Error state doesn't block other app functionality
- User can retry search after error

**Edge Cases**:
- What if API is intermittently failing? → Allow retry, suggest manual entry after 2 failed attempts
- What if API rate limit is reached? → Display: "Search limit reached. Please try again in a few minutes or add manually."
- What if multiple APIs are configured and one fails? → Silently try fallback API, only show error if all fail

---

## 3. Data Requirements

### 3.1 Book Metadata from External APIs

**Expected Fields** (based on typical API responses):
- `title` (required)
- `author` / `authors` (required, may be array)
- `coverImageUrl` / `thumbnail`
- `description` / `synopsis`
- `genres` / `categories` (array)
- `publicationDate` / `publishedDate`
- `pageCount`
- `isbn` / `isbn13`
- `language`
- `publisher`

**Data Mapping**:
- Map external API response to internal book data model
- Handle variations in field names across APIs
- Normalize author arrays to comma-separated string or array
- Extract year from publication date if only year is needed

### 3.2 Manual Entry Data

**Required Fields**:
- Title
- Author

**Optional Fields**:
- Description
- Genre (single or comma-separated)
- Publication Date (year or full date)
- Cover Image URL

---

## 4. User Interface Requirements

### 4.1 Search Interface

**Layout**:
- Prominent search box with placeholder text: "Search by title, author, or ISBN..."
- Search button or auto-search on typing
- Loading indicator during search
- Results displayed in grid or list below search box
- "Add Manually" button always visible

**Search Results**:
- Each result shows: thumbnail, title, author, year, short description
- "Add to Read" and "Add to TBR" buttons on each result
- Click on result to view full details
- Clear "No results" state with suggestion to add manually

### 4.2 Manual Entry Form

**Layout**:
- Modal or dedicated page with form fields
- Clear labels for required vs optional fields
- Preview of how book will appear in library
- Submit and Cancel buttons
- Dropdown or toggle to choose Read vs TBR status

### 4.3 Loading and Error States

**Requirements**:
- Loading spinner or skeleton UI during search
- Clear error messages for different failure scenarios
- Retry button for failed searches
- Fallback messaging always suggests manual entry as alternative

---

## 5. Performance Requirements

- Search results must appear within 3 seconds
- Search debouncing: 500ms after user stops typing
- Manual entry form must submit within 1 second
- Book detail view from search must load within 1 second
- Search interface must remain responsive even if API is slow

---

## 6. Error Handling

### 6.1 API Connection Errors

**Scenario**: External API is unreachable

**Behavior**:
- Display: "Book search is temporarily unavailable. You can add books manually."
- Manual entry button highlighted
- No retry loop (user-initiated retry only)

### 6.2 API Timeout Errors

**Scenario**: API response takes >5 seconds

**Behavior**:
- Display: "Search is taking longer than expected."
- Provide "Cancel" button to stop waiting
- Suggest manual entry alternative

### 6.3 Empty Results

**Scenario**: Search returns zero results

**Behavior**:
- Display: "No books found for '[query]'. Try a different search or add manually."
- Suggest refining search query
- Highlight "Add Manually" option

### 6.4 Rate Limiting

**Scenario**: API rate limit exceeded

**Behavior**:
- Display: "Search limit reached. Please try again in a few minutes or add manually."
- Disable search for 60 seconds (show countdown)
- Manual entry remains available

### 6.5 Invalid Manual Entry

**Scenario**: User submits manual form without required fields

**Behavior**:
- Highlight missing required fields
- Display: "Please provide both title and author"
- Don't submit until valid

---

## 7. External API Integration

### 7.1 Supported APIs

**Primary**: Google Books API
- Endpoint: `https://www.googleapis.com/books/v1/volumes?q={query}`
- Free tier available
- Good metadata coverage

**Secondary (Fallback)**: Open Library API
- Endpoint: `https://openlibrary.org/search.json?q={query}`
- Free and open
- Alternative if Google Books fails

### 7.2 API Requirements

**Behavior**:
- Try primary API first
- If primary fails, try secondary
- If both fail, show error and manual entry option
- Cache successful responses for 24 hours to reduce API calls
- Implement rate limiting on client side (max 10 searches per minute)

### 7.3 Data Privacy

**Requirements**:
- Search queries should not be logged or stored server-side
- API keys (if required) must be secured server-side, not exposed in client
- User's search history is not tracked

---

## 8. Dependencies

### Depends On:
- **User Authentication** (FRD-005): User must be logged in to add books
- **Book Library Management** (FRD-001): Books are added to user's library

### Depended On By:
- None (standalone feature that feeds into library)

---

## 9. Open Questions

1. Should search history be saved for user convenience? → **No for v1, adds complexity**
2. Should users be able to edit book metadata after adding from search? → **Yes, defer to FRD-001 edit functionality**
3. Which external API should be primary (Google Books vs Open Library)? → **Google Books for richer metadata**
4. Should ISBN scanning be supported via camera? → **Out of scope for v1 (web-first, no mobile)**
5. How long should search result cache last? → **24 hours to balance freshness and API costs**
6. Should advanced search be supported (filter by year, genre)? → **Defer to v2 for simplicity**

---

## 10. Non-Functional Requirements

### Reliability
- Graceful degradation when external APIs are unavailable
- No data loss during failed add operations
- Manual entry always available as fallback

### Usability
- Search feels instant (debounced, not on every keystroke)
- Results are easy to scan visually
- Adding a book requires minimal clicks

### Security
- API keys stored securely server-side
- Search queries don't expose user's reading interests to third parties beyond API providers
- HTTPS for all external API calls

---

**Traceability Matrix**:

| PRD Requirement | FRD Section |
|-----------------|-------------|
| REQ-2: Book Information & Search | 2.1 - 2.4 (search, view details, add, manual entry) |
| REQ-7: API Integration & Resilience | 2.5, 6.1 - 6.4, 7.1 - 7.2 |
| REQ-9: User Interface Requirements | 4.1 - 4.3, 5 |
| REQ-10: Basic Error Handling | 6.1 - 6.5 |

---

**Document Version**: 1.0  
**Status**: Ready for Technical Review
