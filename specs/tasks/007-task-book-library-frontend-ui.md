# Task 007: Book Library Management Frontend UI

**Feature**: Book Library Management (FRD-001)  
**Dependencies**: Task 002 (Frontend Scaffolding), Task 005 (Auth Frontend), Task 006 (Book Library Backend)  
**Estimated Complexity**: High

---

## Description

Build the book library user interface including book grid/list views, filtering, add/edit/delete functionality, and status management.

---

## Technical Requirements

### Pages

#### `app/books/page.tsx` (Server Component)
- Fetches user's books from API
- Displays Read and TBR tabs
- Shows book grid with covers
- Empty state when no books

#### `app/books/[id]/page.tsx` (Dynamic Route)
- Book detail view with full metadata
- Edit and delete actions
- Status change controls

#### `app/books/add/page.tsx`
- Manual book entry form
- Links to search functionality

### Components

Create in `components/books/`:

#### `BookGrid.tsx` (Client Component)
- Grid layout displaying book cards
- Responsive columns (2-6 based on screen width)
- Loading skeleton state

#### `BookCard.tsx`
- Displays cover, title, author, status
- Rating stars if rated
- Hover actions (view, change status, delete)
- Click opens detail view

#### `BookDetail.tsx`
- Full book information display
- Edit button
- Delete button with confirmation
- Change status dropdown

#### `AddBookForm.tsx`
- Manual entry form fields
- Validation
- Submit to POST /api/books

#### `BookFilters.tsx`
- Status filter (All, Read, TBR)
- Search box (filter by title/author)
- Clear filters button

#### `StatusBadge.tsx`
- Visual badge for book status
- Different colors per status

#### `ConfirmDialog.tsx`
- Reusable confirmation modal
- Used for delete confirmation

### API Client Functions

Create in `lib/api/books.ts`:

```typescript
export async function getBooks(status?: BookStatus): Promise<Book[]>

export async function getBookById(id: string): Promise<Book>

export async function addBook(data: AddBookRequest): Promise<Book>

export async function updateBook(id: string, data: UpdateBookRequest): Promise<Book>

export async function updateBookStatus(id: string, status: BookStatus): Promise<Book>

export async function deleteBook(id: string): Promise<void>
```

### Types

Create in `types/book.ts`:

```typescript
export enum BookStatus {
  ToRead = 'ToRead',
  Reading = 'Reading',
  Completed = 'Completed'
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  coverImageUrl?: string;
  description?: string;
  genres?: string[];
  publicationDate?: string;
  status: BookStatus;
  addedDate: string;
  source?: string;
  rating?: Rating;
}

export interface AddBookRequest {
  title: string;
  author: string;
  isbn?: string;
  coverImageUrl?: string;
  description?: string;
  genres?: string[];
  publicationDate?: string;
  status: BookStatus;
  source?: string;
}
```

### State Management

Use React state and URL parameters:
- Active status filter in URL search params
- Search query in URL search params
- Book list refetched on filter change
- Optimistic updates for status changes

### Image Handling

- Use Next.js `<Image>` component for covers
- Placeholder image for missing covers
- Lazy loading for performance
- Responsive sizes

---

## Acceptance Criteria

### Book Library Page
- [ ] Displays user's books in grid layout
- [ ] Tab navigation between Read and TBR
- [ ] Book cards show cover, title, author, status
- [ ] Rated books display star rating
- [ ] Empty state when no books with "Add your first book" CTA
- [ ] Loads within 2 seconds for 500 books
- [ ] Responsive layout (2-6 columns)

### Filtering
- [ ] Status filter (All, Read, TBR) works correctly
- [ ] Search box filters by title and author
- [ ] Filters are case-insensitive
- [ ] URL updates with active filters
- [ ] Shareable URL with filters applied
- [ ] Clear filters button resets all filters

### Book Card Interactions
- [ ] Click card opens detail view
- [ ] Hover shows quick actions
- [ ] Change status updates immediately (optimistic)
- [ ] Delete shows confirmation dialog
- [ ] Book cards accessible via keyboard

### Book Detail Page
- [ ] Displays all book metadata
- [ ] Shows larger cover image
- [ ] Edit button opens edit form
- [ ] Delete button shows confirmation
- [ ] Status dropdown allows changes
- [ ] Back button returns to library

### Add Book Form
- [ ] Form validates required fields (title, author)
- [ ] Submit creates book via API
- [ ] Success redirects to library
- [ ] Errors displayed clearly
- [ ] Cover URL field optional
- [ ] Status selection required

### Image Handling
- [ ] Book covers load efficiently
- [ ] Missing covers show placeholder
- [ ] Images optimized with Next.js Image
- [ ] Lazy loading prevents initial load bloat

---

## Testing Requirements

### Unit Tests (≥85% coverage)

**Test Cases**:

1. **BookGrid Component**:
   - Renders list of books
   - Shows empty state when no books
   - Handles loading state
   
2. **BookCard Component**:
   - Displays book information
   - Shows rating if exists
   - Calls delete with confirmation
   - Calls status change handler
   
3. **BookFilters Component**:
   - Updates URL params on filter change
   - Clears filters correctly
   
4. **AddBookForm Component**:
   - Validates required fields
   - Submits data to API
   - Displays server errors

### Integration Tests

**Test Cases**:

1. **Library Flow**:
   - User can view books
   - User can filter by status
   - User can search books
   - User can add new book
   - User can delete book
   - User can change book status

---

## Definition of Done

- [ ] All pages and components created
- [ ] All unit tests pass with ≥85% coverage
- [ ] Library displays books correctly
- [ ] Filtering and search work
- [ ] Add/edit/delete operations function
- [ ] UI is responsive and accessible
- [ ] Images load efficiently
- [ ] Code reviewed and approved
