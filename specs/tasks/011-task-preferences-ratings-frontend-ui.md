# Task 011: User Preferences and Ratings Frontend UI

**Feature**: User Preferences & Ratings (FRD-003)  
**Dependencies**: Task 002 (Frontend Scaffolding), Task 007 (Book Library Frontend), Task 010 (Preferences/Ratings Backend)  
**Estimated Complexity**: Medium

---

## Description

Build UI for rating books, adding notes, and configuring reading preferences. Integrate with book library views.

---

## Technical Requirements

### Components

Create in `components/ratings/`:

#### `RatingStars.tsx`
- Interactive star rating (1-5 stars)
- Click to rate
- Display only mode for rated books
- Hover preview

#### `RatingForm.tsx`
- Star rating input
- Notes textarea (max 1000 chars)
- Character counter
- Save/Cancel buttons

#### `NotesDisplay.tsx`
- Display book notes
- Edit button
- Expandable if long

Create in `components/preferences/`:

#### `PreferencesForm.tsx`
- Multi-select genre checkboxes
- Tag input for themes
- Author input field (comma-separated)
- Save button

#### `RatingSummary.tsx`
- Display total books rated
- Average rating
- Rating distribution chart

### Pages

#### `app/books/[id]/page.tsx` (update)
- Add RatingForm component
- Display existing rating if exists
- Show/edit notes

#### `app/preferences/page.tsx` (new)
- User preferences configuration
- Rating summary dashboard
- Save preferences

### API Client Functions

Create in `lib/api/ratings.ts`:

```typescript
export async function addOrUpdateRating(
  bookId: string,
  score: number,
  notes?: string
): Promise<Rating>

export async function deleteRating(bookId: string): Promise<void>
```

Create in `lib/api/preferences.ts`:

```typescript
export async function getPreferences(): Promise<UserPreferences>

export async function updatePreferences(
  data: UpdatePreferencesRequest
): Promise<UserPreferences>
```

### Validation

- Rating: 1-5 integer
- Notes: Max 1000 characters with counter
- Genres: Select from predefined list
- Themes/Authors: Free text, comma-separated

### Integration Points

- Book detail page includes rating form
- Library grid shows rating stars on book cards
- Moving book from TBR to Read prompts for rating
- Preferences accessible from user menu

---

## Acceptance Criteria

### Rating Interface
- [ ] Star rating component displays 5 stars
- [ ] Click star to set rating
- [ ] Hover previews rating before click
- [ ] Current rating highlighted
- [ ] Can change rating by clicking different star

### Notes Interface
- [ ] Textarea for notes below rating stars
- [ ] Character counter shows "X/1000 characters"
- [ ] Counter turns red when approaching limit
- [ ] Auto-save or explicit Save button
- [ ] Notes display in book detail view

### Rating in Book Library
- [ ] Book cards show star rating if rated
- [ ] Unrated books show "Rate this book"
- [ ] Click opens rating form
- [ ] Rated books show note icon if notes exist

### Preferences Page
- [ ] Genre selection with common genres listed
- [ ] Theme/topic tag input
- [ ] Favorite authors input
- [ ] Save button updates preferences
- [ ] Success message on save
- [ ] Rating summary shows statistics

### Rating Summary
- [ ] Displays total books rated
- [ ] Shows average rating
- [ ] Chart showing distribution (X books rated 5 stars, etc.)
- [ ] Link to rate more books if below minimum (3)

### Status Change Prompt
- [ ] Moving book from TBR to Read prompts "Rate this book?"
- [ ] Can skip rating
- [ ] Rating modal opens if user chooses to rate

---

## Testing Requirements

### Unit Tests (≥85% coverage)

**Test Cases**:

1. **RatingStars Component**:
   - Displays correct number of filled stars
   - Click updates rating
   - Hover previews rating
   
2. **RatingForm Component**:
   - Validates rating 1-5
   - Enforces notes character limit
   - Calls API on save
   
3. **PreferencesForm Component**:
   - Validates inputs
   - Submits preferences to API
   - Displays current preferences

### Integration Tests

**Test Cases**:

1. **Rating Flow**:
   - User rates book → rating saved
   - User adds notes → notes saved
   - User updates rating → rating updated
   - User deletes rating → rating removed
   
2. **Preferences Flow**:
   - User sets preferences → saved
   - Preferences displayed on return
   - Empty preferences handled

---

## Definition of Done

- [ ] All components created
- [ ] All unit tests pass with ≥85% coverage
- [ ] Rating interface functional
- [ ] Notes interface functional
- [ ] Preferences page works
- [ ] Integration with library complete
- [ ] UI is responsive and accessible
- [ ] Code reviewed and approved
