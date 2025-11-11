# Task 013: AI Recommendations Frontend UI

**Feature**: AI-Powered Recommendations (FRD-004)  
**Dependencies**: Task 002 (Frontend Scaffolding), Task 007 (Book Library Frontend), Task 012 (AI Recommendations Backend)  
**Estimated Complexity**: Medium

---

## Description

Build AI recommendations page with generation UI, loading states, recommendation display, and add-to-library integration.

---

## Technical Requirements

### Pages

#### `app/recommendations/page.tsx`
- Recommendations dashboard
- Generate button
- Display recommendations
- Minimum data requirement check

### Components

Create in `components/recommendations/`:

#### `RecommendationCard.tsx`
- Book title, author, genre
- Recommendation reason (explanation)
- Confidence score (stars or percentage)
- "Add to TBR" button
- "Not Interested" button

#### `RecommendationsList.tsx`
- Grid of recommendation cards
- Loading skeleton during generation
- Empty state when no recommendations

#### `GenerateButton.tsx`
- Primary CTA button
- Shows loading during generation
- Disabled during generation
- Shows progress/status

#### `InsufficientDataBanner.tsx`
- Banner when user has <3 rated books
- Shows progress: "Rate 2 more books to unlock recommendations"
- Link to library to rate books

#### `RecommendationLoading.tsx`
- Loading state component
- Message: "Discovering books you'll love..."
- Animation or progress indicator
- Estimated time remaining

### API Client Functions

Create in `lib/api/recommendations.ts`:

```typescript
export async function generateRecommendations(
  count?: number
): Promise<RecommendationsResponse>

export interface BookRecommendation {
  title: string;
  author: string;
  genre?: string;
  reason: string;
  confidenceScore: number;
}

export interface RecommendationsResponse {
  recommendations: BookRecommendation[];
  generatedAt: string;
  booksAnalyzed: number;
}
```

### State Management

- Recommendations cached in component state
- Generated timestamp displayed
- Refresh generates new recommendations
- Loading state during API call
- Error state for failures

### User Flow

1. User navigates to recommendations page
2. Check if user has ≥3 rated books
   - If yes: Show generate button
   - If no: Show insufficient data banner
3. User clicks "Generate Recommendations"
4. Loading state for up to 10 seconds
5. Display recommendations
6. User can add recommendations to TBR
7. User can refresh for new recommendations

---

## Acceptance Criteria

### Recommendations Page
- [ ] Page accessible from main navigation
- [ ] Shows generate button if user has ≥3 rated books
- [ ] Shows insufficient data banner if <3 rated books
- [ ] Banner shows progress toward minimum
- [ ] Link to library from banner

### Insufficient Data State
- [ ] Banner displays: "Rate at least 3 books to unlock AI recommendations"
- [ ] Shows current progress: "You've rated X of 3 books"
- [ ] "Go to Library" button links to /books
- [ ] Generate button disabled

### Generate Recommendations
- [ ] "Get Recommendations" button prominent
- [ ] Click triggers API call
- [ ] Loading state shown during generation
- [ ] Loading message: "Discovering books you'll love..."
- [ ] Generation completes within 10 seconds
- [ ] Error shown if generation fails
- [ ] Retry button on error

### Recommendations Display
- [ ] Recommendations displayed in grid
- [ ] Each shows title, author, genre, reason, confidence
- [ ] Reason (explanation) clearly visible
- [ ] Confidence score shown (stars or number)
- [ ] "Add to TBR" button on each recommendation
- [ ] "Not Interested" button/link
- [ ] Generated timestamp displayed
- [ ] Number of books analyzed shown

### Add to Library Integration
- [ ] "Add to TBR" calls POST /api/books
- [ ] Success shows confirmation
- [ ] Added books marked as "Added"
- [ ] Can't add same book twice
- [ ] Error handling for failed adds

### Refresh Recommendations
- [ ] "Refresh" button visible after generation
- [ ] Click generates new recommendations
- [ ] Subject to rate limiting (10/day)
- [ ] Rate limit exceeded shows message
- [ ] Message includes time until reset

### Rate Limiting UI
- [ ] Shows "X recommendations remaining today"
- [ ] At limit: "You've reached today's limit (10). Try again tomorrow."
- [ ] Countdown to reset time displayed
- [ ] Existing recommendations still viewable

---

## Testing Requirements

### Unit Tests (≥85% coverage)

**Test Cases**:

1. **RecommendationCard Component**:
   - Displays book information
   - Shows recommendation reason
   - Calls add to TBR handler
   - Disables "Not Interested"
   
2. **InsufficientDataBanner Component**:
   - Shows progress toward minimum
   - Links to library
   - Hidden when user has enough data
   
3. **GenerateButton Component**:
   - Calls API on click
   - Shows loading state
   - Disabled during generation

### Integration Tests

**Test Cases**:

1. **Recommendations Flow**:
   - User with <3 rated books sees banner
   - User with ≥3 rated books can generate
   - Generate → Loading → Display works
   - Add to TBR adds book to library
   - Refresh generates new recommendations
   - Rate limit prevents excess requests

---

## Definition of Done

- [ ] Recommendations page created
- [ ] All components implemented
- [ ] All unit tests pass with ≥85% coverage
- [ ] Generate recommendations works
- [ ] Recommendations display correctly
- [ ] Add to library integration works
- [ ] Rate limiting enforced
- [ ] Insufficient data handled gracefully
- [ ] UI is responsive and accessible
- [ ] Code reviewed and approved
