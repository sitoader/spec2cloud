# Feature Requirement Document (FRD): User Preferences & Ratings

**Feature ID**: FRD-003  
**Feature Name**: User Preferences & Ratings  
**Related PRD Requirements**: REQ-3, REQ-6, REQ-9, REQ-10  
**Status**: Draft  
**Last Updated**: November 11, 2025

---

## 1. Feature Overview

### Purpose
Enable users to express their opinions about books through ratings and notes, and configure their reading preferences to guide AI recommendations. This feature transforms a passive library into an active feedback system that powers personalized discovery.

### Value Proposition
Users can capture their thoughts on books they've read, ensuring they remember why they liked or disliked a book. Their preferences and ratings directly influence the quality and relevance of AI-generated recommendations.

### Success Criteria
- 70% of users rate at least 3 books within their first week
- 60% of users configure at least one reading preference
- Users with 5+ rated books receive higher quality AI recommendations (measured by recommendation acceptance rate)
- Rating interface accessible within 2 clicks from any book view

---

## 2. Functional Requirements

### 2.1 Rate Books

**Description**: Users must be able to assign ratings to books they've read to indicate how much they enjoyed them.

**Inputs**:
- Book ID
- Rating value (scale to be determined: 5-star, thumbs up/down, or 1-10)
- User action

**Outputs**:
- Rating saved to book record
- Visual indicator updated on book (in library and detail views)
- Confirmation message (subtle, non-intrusive)

**Acceptance Criteria**:
- Rating interface is simple and intuitive (e.g., 5-star click interface)
- Users can rate books from: library view (quick action), book detail view, or after moving book from TBR to Read
- Rating updates immediately in UI
- Users can change ratings at any time
- Rating is visually displayed on book cards in library
- Only books marked as "Read" can be rated (TBR books show "Not yet rated")

**Edge Cases**:
- What if user tries to rate TBR book? → Disable rating or show message: "Mark as Read to rate this book"
- What if user changes rating multiple times? → Allow freely, keep only latest rating
- What if rating fails to save? → Show error, allow retry, maintain old rating until new one saves

---

### 2.2 Add Personal Notes/Reviews

**Description**: Users must be able to add text notes or brief reviews to books they've read to capture their thoughts.

**Inputs**:
- Book ID
- Note text (free-form, suggested max 500-1000 characters)
- User action

**Outputs**:
- Note saved to book record
- Note visible in book detail view
- Visual indicator on book card that note exists

**Acceptance Criteria**:
- Notes can be added from book detail view
- Text area supports multi-line input
- Character counter shows remaining space (if limit imposed)
- Notes are saved automatically (debounced) or on explicit "Save" action
- Users can edit notes at any time
- Notes are optional (users can rate without notes)
- Small icon on book card indicates note exists

**Edge Cases**:
- What if note exceeds character limit? → Show warning, prevent submission beyond limit
- What if auto-save fails? → Show error, provide manual save button
- What if user navigates away while typing? → Prompt to save unsaved changes or auto-save on blur

---

### 2.3 Indicate Disliked Books

**Description**: Users must be able to explicitly mark books they disliked to help AI avoid recommending similar books.

**Inputs**:
- Book ID
- Dislike indication (e.g., low rating or explicit "thumbs down")

**Outputs**:
- Dislike signal stored with book
- Book marked visually as disliked in library
- AI recommendation engine uses this signal to avoid similar books

**Acceptance Criteria**:
- Dislike can be indicated through low rating (e.g., 1-2 stars) or explicit "thumbs down" action
- Users can optionally add note explaining why they disliked it
- Disliked books remain in library but are visually distinguished
- Filter option to hide/show disliked books in library
- AI system receives clear signal to avoid recommending similar books

**Edge Cases**:
- What if user accidentally marks book as disliked? → Allow easy undo or rating change
- What if user dislikes book but wants to keep it in library? → Dislike doesn't remove book, just influences recommendations
- What if user has many disliked books? → Provide filter to hide them from main view

---

### 2.4 Configure Reading Preferences

**Description**: Users must be able to specify their reading preferences including favorite genres, themes, and authors to guide recommendations.

**Inputs**:
- Preferred genres (multi-select from common genres)
- Preferred themes/topics (free text or tags)
- Favorite authors (free text or search)
- Optional: reading pace preference, book length preference

**Outputs**:
- Preferences saved to user profile
- Preferences displayed in user settings/preferences page
- AI recommendation engine uses these preferences as input

**Acceptance Criteria**:
- Preferences are accessible from user settings or profile page
- Genre selection from predefined list (e.g., Fiction, Non-Fiction, Mystery, Sci-Fi, Romance, Biography, etc.)
- Themes/topics are free-form tags or text input
- Favorite authors can be typed or selected from books in library
- Users can update preferences at any time
- Changes take effect immediately for next recommendation generation
- Preferences are optional (app works without them but recommendations may be less accurate)

**Edge Cases**:
- What if user selects too many genres? → Allow all selections but inform that specific preferences yield better results
- What if user doesn't configure preferences? → Use ratings and reading history exclusively for recommendations
- What if user's preferences conflict with reading history? → AI should balance both signals

---

### 2.5 View Rating and Preference Summary

**Description**: Users must be able to see a summary of their ratings and preferences to understand what data is driving their recommendations.

**Inputs**:
- User request to view summary

**Outputs**:
- Dashboard or summary page showing:
  - Total books rated
  - Average rating
  - Configured preferences (genres, themes, authors)
  - Most rated genre
  - Rating distribution (how many 5-star, 4-star, etc.)
- Link to edit preferences

**Acceptance Criteria**:
- Summary accessible from user profile or settings
- Visual representation of rating distribution (chart or graph)
- Clear indication of configured vs unconfigured preferences
- Call-to-action to rate more books if below minimum for recommendations (e.g., "Rate 2 more books to unlock AI recommendations")

**Edge Cases**:
- What if user has no ratings? → Show empty state with encouragement to rate books
- What if user has rated many books? → Summarize statistics, don't list all individual ratings

---

## 3. Data Requirements

### 3.1 Rating Data Model

**Book Rating Extension** (adds to Book entity from FRD-001):
- `rating` (number: 1-5 for 5-star, or boolean for thumbs up/down)
- `ratedDate` (timestamp of when rating was added/updated)
- `isDisliked` (optional boolean flag for explicit dislike)

**Alternative Rating Scales** (choose one):
- **5-star**: 1-5 scale, most familiar to users
- **Thumbs up/down**: Simplest, binary feedback
- **1-10 scale**: More granular but may be overwhelming

**Recommendation**: Start with 5-star for familiarity and granularity

### 3.2 Notes Data Model

**Book Notes Extension** (adds to Book entity):
- `notes` (text, max 1000 characters)
- `notesUpdatedDate` (timestamp)

### 3.3 User Preferences Data Model

**User Preferences Entity**:
- `userId` (links to user account)
- `preferredGenres` (array of genre strings)
- `preferredThemes` (array of theme/topic strings)
- `favoriteAuthors` (array of author names)
- `readingPacePreference` (optional: "fast", "moderate", "slow")
- `bookLengthPreference` (optional: "short", "medium", "long", "any")
- `preferencesUpdatedDate` (timestamp)

### 3.4 Data Persistence

**Requirements**:
- Ratings and notes must persist with book records
- Preferences must persist in user profile
- All changes saved immediately (no manual save required)
- Data must sync across devices/sessions

---

## 4. User Interface Requirements

### 4.1 Rating Interface

**Library View**:
- Star rating display on each book card (for Read books)
- Hover over stars to change rating
- Click to set rating
- Empty stars for unrated books with prompt "Rate this book"

**Book Detail View**:
- Larger star rating interface
- Display current rating prominently
- Click to change rating
- Show rating date ("Rated on [date]")

### 4.2 Notes Interface

**Book Detail View**:
- Text area for notes below rating
- "Add your thoughts..." placeholder
- Character counter (e.g., "450/1000 characters")
- Auto-save indicator ("Saving..." → "Saved")
- Edit/delete options for existing notes

**Library View**:
- Small note icon on book card if note exists
- Hover tooltip preview of note (first 100 chars)

### 4.3 Preferences Interface

**Settings/Profile Page**:
- Section for "Reading Preferences"
- Multi-select dropdown or checkboxes for genres
- Tag input for themes/topics
- Search/autocomplete for favorite authors
- Optional sliders or dropdowns for pace and length preferences
- Save button or auto-save
- Visual feedback when preferences updated

### 4.4 Summary Dashboard

**Preferences/Profile Page**:
- Card showing rating statistics (total rated, average, distribution)
- Card showing configured preferences (genres, themes, authors)
- Progress indicator toward minimum recommendations threshold
- Quick links to rate more books or edit preferences

---

## 5. Performance Requirements

- Rating must update UI within 300ms
- Notes auto-save must trigger 1 second after user stops typing
- Preferences save must complete within 1 second
- Summary dashboard must load within 2 seconds

---

## 6. Error Handling

### 6.1 Rating Save Failure

**Scenario**: Rating fails to save due to network error

**Behavior**:
- Display error: "Unable to save rating. Please try again."
- Provide retry button
- Revert to previous rating visually until save succeeds

### 6.2 Notes Save Failure

**Scenario**: Notes fail to save (auto-save or manual save)

**Behavior**:
- Display error: "Unable to save notes. Please try again."
- Change auto-save indicator to "Save failed - Retry"
- Provide manual save/retry button
- Don't lose user's typed content

### 6.3 Preferences Save Failure

**Scenario**: Preferences update fails

**Behavior**:
- Display error: "Unable to save preferences. Please try again."
- Provide retry button
- Revert to previous preferences until save succeeds
- Don't lose user's selections

### 6.4 Invalid Input

**Scenario**: User tries to save notes exceeding character limit

**Behavior**:
- Highlight character count in red
- Display: "Notes cannot exceed [limit] characters"
- Disable save until within limit

---

## 7. Dependencies

### Depends On:
- **Book Library Management** (FRD-001): Ratings and notes extend book records in library
- **User Authentication** (FRD-005): Preferences and ratings are user-specific

### Depended On By:
- **AI Recommendations** (FRD-004): Uses ratings and preferences as primary input for generating recommendations

---

## 8. Open Questions

1. **Rating scale**: 5-star, thumbs up/down, or 1-10 scale? → **Recommend 5-star for familiarity**
2. **Notes character limit**: 500, 1000, or unlimited? → **Recommend 1000 for balance**
3. **Auto-save vs manual save**: Which for notes? → **Recommend auto-save for better UX**
4. **Can TBR books have notes?** → **Yes, allow for "why I want to read this"**
5. **Should ratings be required for books marked as Read?** → **No, keep optional for flexibility**
6. **Should preferences have suggested/autocomplete values?** → **Yes for genres (predefined), optional for themes/authors**
7. **Can users rate books multiple times to track re-reads?** → **Not in v1, single rating per book**

---

## 9. Non-Functional Requirements

### Usability
- Rating interaction feels instant and satisfying
- Notes interface encourages longer-form thoughts
- Preferences are easy to configure and understand

### Data Quality
- Ratings are granular enough to distinguish preference levels
- Notes provide qualitative context for quantitative ratings
- Preferences are flexible enough to capture diverse reading tastes

### AI Input Quality
- Rating data is structured for easy consumption by AI
- Preferences are clearly defined and unambiguous
- Dislike signals are explicit and actionable

---

**Traceability Matrix**:

| PRD Requirement | FRD Section |
|-----------------|-------------|
| REQ-3: Personal Preferences & Ratings | 2.1 - 2.5 (all functional requirements) |
| REQ-6: Data Persistence | 3.4, 6.1 - 6.3 |
| REQ-9: User Interface Requirements | 4.1 - 4.4, 5 |
| REQ-10: Basic Error Handling | 6.1 - 6.4 |

---

**Document Version**: 1.0  
**Status**: Ready for Technical Review
