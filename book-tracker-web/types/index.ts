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
