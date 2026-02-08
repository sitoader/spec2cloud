/**
 * BookTracker — shared TypeScript contracts.
 *
 * Every interface in this module mirrors a backend DTO from the
 * ASP.NET BookTracker API so the front-end stays in lockstep with
 * the wire format.
 */

/** @deprecated Prefer {@link BookTrackerAccount} for authenticated identity. */
export type User = {
  id: string;
  email: string;
  name: string;
};

/* ------------------------------------------------------------------ */
/*  Request payloads                                                   */
/* ------------------------------------------------------------------ */

/** Wire payload for POST /api/auth/register. */
export interface BookTrackerSignupPayload {
  email: string;
  password: string;
  displayName?: string;
}

/** Wire payload for POST /api/auth/login. */
export interface BookTrackerCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Response shapes                                                    */
/* ------------------------------------------------------------------ */

/** Successful auth response from register or login endpoints. */
export interface BookTrackerSessionData {
  userId: string;
  email: string;
  displayName: string;
  token: string;
  expiresAt: string;
}

/** Lightweight identity returned by GET /api/auth/me. */
export interface BookTrackerAccount {
  userId: string;
  email: string;
  displayName: string;
}

/** Standard error envelope produced by the BookTracker API. */
export interface BookTrackerErrorEnvelope {
  message: string;
  errors?: Record<string, string[]>;
  traceId?: string;
}

/* ------------------------------------------------------------------ */
/*  Book types                                                         */
/* ------------------------------------------------------------------ */

/** Book reading status. */
export enum BookTrackerBookStatus {
  ToRead = 0,
  Reading = 1,
  Completed = 2,
}

/** Book rating data. */
export interface BookTrackerRating {
  id: string;
  score: number;
  notes?: string;
  ratedDate: string;
  updatedDate?: string;
}

/** Book DTO from the API. */
export interface BookTrackerBook {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  coverImageUrl?: string;
  description?: string;
  genres?: string[];
  publicationDate?: string;
  status: BookTrackerBookStatus;
  addedDate: string;
  source?: string;
  rating?: BookTrackerRating;
}

/** Request payload for adding a new book. */
export interface BookTrackerAddBookPayload {
  title: string;
  author: string;
  isbn?: string;
  coverImageUrl?: string;
  description?: string;
  genres?: string[];
  publicationDate?: string;
  status: BookTrackerBookStatus;
  source?: string;
}

/** Request payload for updating a book. */
export interface BookTrackerUpdateBookPayload {
  title?: string;
  author?: string;
  isbn?: string;
  coverImageUrl?: string;
  description?: string;
  genres?: string[];
  publicationDate?: string;
  status?: BookTrackerBookStatus;
  source?: string;
}

/** Request payload for updating book status. */
export interface BookTrackerUpdateBookStatusPayload {
  status: BookTrackerBookStatus;
}

/** Paginated response for books listing. */
export interface BookTrackerBooksResponse {
  items: BookTrackerBook[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/* ------------------------------------------------------------------ */
/*  User preferences types                                             */
/* ------------------------------------------------------------------ */

/** User reading preferences DTO (mirrors UserPreferencesDto). */
export interface BookTrackerUserPreferences {
  id: string;
  preferredGenres?: string[];
  preferredThemes?: string[];
  favoriteAuthors?: string[];
  createdDate: string;
  updatedDate?: string;
}

/** Request payload for updating user preferences. */
export interface BookTrackerUpdatePreferencesPayload {
  preferredGenres?: string[];
  preferredThemes?: string[];
  favoriteAuthors?: string[];
}

/* ------------------------------------------------------------------ */
/*  External book search types                                         */
/* ------------------------------------------------------------------ */

/** Book result from an external search API (mirrors ExternalBookDto). */
export interface BookTrackerExternalBook {
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

/* ------------------------------------------------------------------ */
/*  AI recommendation types                                            */
/* ------------------------------------------------------------------ */

/** A single AI-generated book recommendation (mirrors BookRecommendationDto). */
export interface BookTrackerBookRecommendation {
  title: string;
  author: string;
  genre?: string;
  reason: string;
  confidenceScore: number;
  /** Enrichment fields from external catalogue lookup */
  description?: string;
  coverImageUrl?: string;
  isbn?: string;
  publicationYear?: number;
  genres?: string[];
  source?: string;
}

/** Response payload from POST /api/recommendations/generate. */
export interface BookTrackerRecommendationsResponse {
  recommendations: BookTrackerBookRecommendation[];
  generatedAt: string;
  booksAnalyzed: number;
}

/* ------------------------------------------------------------------ */
/*  Reading progress types                                             */
/* ------------------------------------------------------------------ */

/** Payload for POST /api/reading-sessions. */
export interface BookTrackerLogSessionPayload {
  bookId: string;
  startTime: string;
  endTime?: string;
  pagesRead?: number;
  currentPage?: number;
  notes?: string;
}

/** Reading session data from the API. */
export interface BookTrackerReadingSession {
  id: string;
  bookId: string;
  startTime: string;
  endTime?: string;
  pagesRead?: number;
  currentPage?: number;
  notes?: string;
  createdAt: string;
}

/** Payload for PUT /api/reading-progress/{bookId}. */
export interface BookTrackerUpdateProgressPayload {
  currentPage: number;
  totalPages?: number;
}

/** Reading progress data from the API. */
export interface BookTrackerReadingProgress {
  id: string;
  bookId: string;
  totalPages?: number;
  currentPage: number;
  progressPercentage: number;
  estimatedCompletionDate?: string;
  lastUpdated: string;
}

/** Reading streak data from the API. */
export interface BookTrackerReadingStreak {
  currentStreak: number;
  longestStreak: number;
  lastReadDate?: string;
}

/* ------------------------------------------------------------------ */
/*  Goals & achievements types                                         */
/* ------------------------------------------------------------------ */

/** Payload for POST /api/reading-goals. */
export interface BookTrackerCreateGoalPayload {
  year: number;
  targetBooksCount: number;
}

/** Payload for PUT /api/reading-goals/{year}. */
export interface BookTrackerUpdateGoalPayload {
  targetBooksCount: number;
}

/** Reading goal data from the API. */
export interface BookTrackerReadingGoal {
  id: string;
  year: number;
  targetBooksCount: number;
  completedBooksCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Achievement badge definition from the API. */
export interface BookTrackerAchievement {
  id: string;
  code: string;
  name: string;
  description?: string;
  iconUrl?: string;
  category?: string;
  requirementValue?: number;
}

/** A user's earned achievement from the API. */
export interface BookTrackerUserAchievement {
  id: string;
  achievementId: string;
  achievement?: BookTrackerAchievement;
  unlockedAt: string;
}

/* ------------------------------------------------------------------ */
/*  Statistics types                                                    */
/* ------------------------------------------------------------------ */

/** Overview statistics from GET /api/statistics/overview. */
export interface BookTrackerStatsOverview {
  totalBooks: number;
  booksThisYear: number;
  booksThisMonth: number;
  averageRating: number;
  totalPagesRead: number;
  currentStreak: number;
}

/** Monthly reading count from GET /api/statistics/reading-by-month. */
export interface BookTrackerMonthlyReading {
  month: number;
  count: number;
}

/** Genre distribution item from GET /api/statistics/genre-distribution. */
export interface BookTrackerGenreDistribution {
  genre: string;
  count: number;
}

/** Author reading count from GET /api/statistics/authors-most-read. */
export interface BookTrackerAuthorReadCount {
  author: string;
  count: number;
}

/* ------------------------------------------------------------------ */
/*  Collections types                                                   */
/* ------------------------------------------------------------------ */

/** Payload for POST /api/collections. */
export interface BookTrackerCreateCollectionPayload {
  name: string;
  description?: string;
  isPublic: boolean;
}

/** Payload for PUT /api/collections/{id}. */
export interface BookTrackerUpdateCollectionPayload {
  name: string;
  description?: string;
  isPublic: boolean;
}

/** Payload for POST /api/collections/{id}/books. */
export interface BookTrackerAddCollectionBookPayload {
  bookId: string;
  notes?: string;
}

/** Collection data from the API. */
export interface BookTrackerCollection {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  bookCount: number;
  createdAt: string;
  updatedAt: string;
}

/* ------------------------------------------------------------------ */
/*  Enhanced review types                                               */
/* ------------------------------------------------------------------ */

/** Payload for POST /api/reviews. */
export interface BookTrackerCreateReviewPayload {
  bookId: string;
  rating: number;
  reviewText?: string;
  reviewHtml?: string;
  isPublic: boolean;
  tags?: string[];
  mood?: string;
  wouldRecommend?: boolean;
}

/** Payload for PUT /api/reviews/{id}. */
export interface BookTrackerUpdateReviewPayload {
  rating: number;
  reviewText?: string;
  reviewHtml?: string;
  isPublic: boolean;
  tags?: string[];
  mood?: string;
  wouldRecommend?: boolean;
}

/** Book review data from the API. */
export interface BookTrackerBookReview {
  id: string;
  userId: string;
  reviewerDisplayName?: string;
  bookId: string;
  rating: number;
  reviewText?: string;
  reviewHtml?: string;
  isPublic: boolean;
  tags?: string[];
  mood?: string;
  wouldRecommend?: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ------------------------------------------------------------------ */
/*  Series tracking types                                               */
/* ------------------------------------------------------------------ */

/** Entry within a book series. */
export interface BookTrackerSeriesEntry {
  id: string;
  bookId: string;
  positionInSeries: number;
}

/** Payload for series book entry in POST /api/series. */
export interface BookTrackerSeriesBookInput {
  bookId: string;
  position: number;
}

/** Payload for POST /api/series. */
export interface BookTrackerCreateSeriesPayload {
  name: string;
  books: BookTrackerSeriesBookInput[];
}

/** Book series data from the API. */
export interface BookTrackerBookSeries {
  id: string;
  name: string;
  totalBooks?: number;
  description?: string;
  entries?: BookTrackerSeriesEntry[];
}

/* ------------------------------------------------------------------ */
/*  Author following types                                              */
/* ------------------------------------------------------------------ */

/** Payload for POST /api/authors/follow. */
export interface BookTrackerFollowAuthorPayload {
  authorName: string;
  notificationsEnabled: boolean;
}

/** Followed author data from the API. */
export interface BookTrackerFollowedAuthor {
  id: string;
  authorName: string;
  followedAt: string;
  notificationsEnabled: boolean;
}
