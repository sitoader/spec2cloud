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

/** DTO for a reading session. */
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

/** Request payload for logging a reading session. */
export interface BookTrackerLogSessionPayload {
  bookId: string;
  startTime: string;
  endTime?: string;
  pagesRead?: number;
  currentPage?: number;
  notes?: string;
}

/** DTO for reading progress. */
export interface BookTrackerReadingProgress {
  id: string;
  bookId: string;
  totalPages?: number;
  currentPage: number;
  progressPercentage: number;
  estimatedCompletionDate?: string;
  lastUpdated: string;
}

/** Request payload for updating reading progress. */
export interface BookTrackerUpdateProgressPayload {
  currentPage: number;
  totalPages?: number;
}

/** DTO for reading streak. */
export interface BookTrackerReadingStreak {
  currentStreak: number;
  longestStreak: number;
  lastReadDate?: string;
}

/* ------------------------------------------------------------------ */
/*  Goals & achievements types                                         */
/* ------------------------------------------------------------------ */

/** DTO for a reading goal. */
export interface BookTrackerReadingGoal {
  id: string;
  year: number;
  targetBooksCount: number;
  completedBooksCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Request payload for setting a reading goal. */
export interface BookTrackerSetGoalPayload {
  year: number;
  targetBooksCount: number;
}

/** DTO for an achievement. */
export interface BookTrackerAchievement {
  id: string;
  code: string;
  name: string;
  description?: string;
  iconUrl?: string;
  category?: string;
  requirementValue?: number;
}

/** DTO for a user achievement. */
export interface BookTrackerUserAchievement {
  id: string;
  achievement?: BookTrackerAchievement;
  unlockedAt: string;
}

/* ------------------------------------------------------------------ */
/*  Statistics types                                                    */
/* ------------------------------------------------------------------ */

/** DTO for statistics overview. */
export interface BookTrackerStatisticsOverview {
  totalBooks: number;
  booksThisYear: number;
  booksThisMonth: number;
  averageRating: number;
  totalPagesRead: number;
  currentStreak: number;
}

/** DTO for monthly book count. */
export interface BookTrackerMonthlyCount {
  month: number;
  count: number;
}

/** DTO for genre distribution. */
export interface BookTrackerGenreCount {
  genre: string;
  count: number;
}

/** DTO for author count. */
export interface BookTrackerAuthorCount {
  author: string;
  count: number;
}

/* ------------------------------------------------------------------ */
/*  Collection types                                                    */
/* ------------------------------------------------------------------ */

/** DTO for a collection. */
export interface BookTrackerCollection {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  bookCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Request payload for creating a collection. */
export interface BookTrackerCreateCollectionPayload {
  name: string;
  description?: string;
  isPublic: boolean;
}

/** Request payload for updating a collection. */
export interface BookTrackerUpdateCollectionPayload {
  name?: string;
  description?: string;
  isPublic?: boolean;
}

/** Request payload for adding a book to a collection. */
export interface BookTrackerAddBookToCollectionPayload {
  bookId: string;
  notes?: string;
}

/** DTO for a collection book entry. */
export interface BookTrackerCollectionBook {
  id: string;
  bookId: string;
  addedAt: string;
  notes?: string;
}

/* ------------------------------------------------------------------ */
/*  Enhanced review types                                               */
/* ------------------------------------------------------------------ */

/** DTO for a book review. */
export interface BookTrackerBookReview {
  id: string;
  userId: string;
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

/** Request payload for creating a review. */
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

/** Request payload for updating a review. */
export interface BookTrackerUpdateReviewPayload {
  rating?: number;
  reviewText?: string;
  reviewHtml?: string;
  isPublic?: boolean;
  tags?: string[];
  mood?: string;
  wouldRecommend?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Series types                                                        */
/* ------------------------------------------------------------------ */

/** DTO for a book series. */
export interface BookTrackerBookSeries {
  id: string;
  name: string;
  totalBooks?: number;
  description?: string;
  entries: BookTrackerBookSeriesEntry[];
  createdAt: string;
}

/** DTO for a series entry. */
export interface BookTrackerBookSeriesEntry {
  id: string;
  bookId: string;
  positionInSeries: number;
}

/** Request payload for creating a series. */
export interface BookTrackerCreateSeriesPayload {
  name: string;
  description?: string;
  totalBooks?: number;
  books: { bookId: string; position: number }[];
}

/* ------------------------------------------------------------------ */
/*  Author following types                                              */
/* ------------------------------------------------------------------ */

/** DTO for a followed author. */
export interface BookTrackerFollowedAuthor {
  id: string;
  authorName: string;
  followedAt: string;
  notificationsEnabled: boolean;
}

/** Request payload for following an author. */
export interface BookTrackerFollowAuthorPayload {
  authorName: string;
  notificationsEnabled: boolean;
}
