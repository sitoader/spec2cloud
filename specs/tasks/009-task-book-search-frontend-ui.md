# Task 009: Book Search and Discovery Frontend UI

**Feature**: Book Search & Discovery (FRD-002)  
**Dependencies**: Task 002 (Frontend Scaffolding), Task 005 (Auth Frontend), Task 008 (Book Search Backend)  
**Estimated Complexity**: Medium

---

## Description

Build book search interface with external database search, result display, and one-click add to library functionality.

---

## Technical Requirements

### Pages

#### `app/search/page.tsx`
- Search interface
- Results display
- Add to library actions

### Components

Create in `components/search/`:

#### `BookSearchBar.tsx` (Client Component)
- Search input with debounce (500ms)
- Minimum 3 characters to trigger search
- Loading indicator during search
- Clear search button

#### `SearchResults.tsx`
- Grid display of search results
- Each result shows cover, title, author, description preview
- "Add to Read" and "Add to TBR" buttons
- Empty state when no results

#### `SearchResultCard.tsx`
- Displays external book info
- Cover image with fallback
- Title, author, description (truncated)
- Publication year, genres if available
- Quick add buttons

#### `BookDetailModal.tsx`
- Modal showing full book details
- Opened by clicking search result
- Full description, all metadata
- Add to library button

### API Client Functions

Create in `lib/api/search.ts`:

```typescript
export async function searchBooks(query: string): Promise<ExternalBook[]>

export interface ExternalBook {
  externalId?: string;
  title: string;
  author: string;
  isbn?: string;
  coverImageUrl?: string;
  description?: string;
  genres?: string[];
  publicationYear?: number;
  source: string;
}
```

### State Management

- Search query in URL params for shareability
- Search results in component state
- Loading state during API call
- Error state for failed searches

### Search Behavior

- Debounced search (wait 500ms after typing stops)
- Don't search if query < 3 characters
- Show message if query too short
- Clear results when query cleared
- Display loading skeleton during search

### Add to Library Integration

When user clicks "Add to Read" or "Add to TBR":
- Map ExternalBook to AddBookRequest
- Call POST /api/books
- Show success message
- Mark book as added in results (prevent duplicate adds)
- Option to view book in library

---

## Acceptance Criteria

### Search Interface
- [ ] Search bar prominently displayed
- [ ] Placeholder text: "Search by title, author, or ISBN..."
- [ ] Searches after 500ms of no typing
- [ ] Shows "Type at least 3 characters" if query too short
- [ ] Displays loading indicator during search
- [ ] Clear button clears search and results

### Search Results
- [ ] Results displayed in grid layout
- [ ] Each result shows cover, title, author, description preview
- [ ] Results show source (Google Books or Open Library)
- [ ] Empty state: "No books found. Try a different search or add manually."
- [ ] Results appear within 3 seconds

### Search Result Cards
- [ ] Cover image displays with fallback for missing
- [ ] Title and author clearly visible
- [ ] Description truncated to ~200 characters
- [ ] "Add to Read" button adds book with Completed status
- [ ] "Add to TBR" button adds book with ToRead status
- [ ] Clicking card opens detail modal
- [ ] Added books show "Added" badge

### Book Detail Modal
- [ ] Opens when clicking search result
- [ ] Shows full description
- [ ] Displays all available metadata
- [ ] Add to library button works from modal
- [ ] Close button returns to results
- [ ] Accessible via keyboard (ESC to close)

### Add to Library
- [ ] Adding book calls POST /api/books API
- [ ] Success shows confirmation message
- [ ] Book added to user's library
- [ ] Duplicate check prevents adding same book twice
- [ ] Error handling for failed adds

### URL State
- [ ] Search query persisted in URL
- [ ] Shareable URL includes current search
- [ ] Back/forward navigation works

---

## Testing Requirements

### Unit Tests (≥85% coverage)

**Test Cases**:

1. **BookSearchBar Component**:
   - Debounces input (doesn't search on every keystroke)
   - Doesn't search if query < 3 characters
   - Shows loading state during search
   - Calls search API with query
   
2. **SearchResults Component**:
   - Renders search results
   - Shows empty state when no results
   - Shows loading skeleton during search
   
3. **SearchResultCard Component**:
   - Displays book information
   - Calls add to library handler
   - Shows "Added" badge after adding
   
4. **BookDetailModal Component**:
   - Opens and closes correctly
   - Displays full book details
   - Add to library button works

### Integration Tests

**Test Cases**:

1. **Search Flow**:
   - User types query → results appear
   - User clicks "Add to TBR" → book added to library
   - User views detail modal → all metadata visible
   - Empty search returns no results message
   - API failure shows error message

---

## Definition of Done

- [ ] Search interface implemented
- [ ] All unit tests pass with ≥85% coverage
- [ ] Search debouncing works
- [ ] Results display correctly
- [ ] Add to library integration works
- [ ] Modal displays book details
- [ ] URL state management works
- [ ] UI is responsive and accessible
- [ ] Code reviewed and approved
