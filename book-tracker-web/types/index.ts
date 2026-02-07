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
/*  Book domain                                                        */
/* ------------------------------------------------------------------ */

/** Reading status enum — mirrors BookStatus in the backend. */
export type BookTrackerBookStatus = 'ToRead' | 'Reading' | 'Completed';

/** Rating data attached to a book. */
export interface BookTrackerRating {
  id: string;
  score: number;
  notes: string | null;
  ratedDate: string;
  updatedDate: string | null;
}

/** Full book record returned by GET /api/books and GET /api/books/:id. */
export interface BookTrackerBook {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  coverImageUrl: string | null;
  description: string | null;
  genres: string[] | null;
  publicationDate: string | null;
  status: BookTrackerBookStatus;
  addedDate: string;
  source: string | null;
  rating: BookTrackerRating | null;
}

/** Paginated response envelope from GET /api/books. */
export interface BookTrackerBookListResponse {
  items: BookTrackerBook[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/** Wire payload for POST /api/books. */
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

/** Wire payload for PUT /api/books/:id. */
export interface BookTrackerUpdateBookPayload {
  title?: string;
  author?: string;
  status?: BookTrackerBookStatus;
  isbn?: string;
  coverImageUrl?: string;
  description?: string;
  genres?: string[];
  publicationDate?: string;
  source?: string;
}

/** Wire payload for PATCH /api/books/:id/status. */
export interface BookTrackerUpdateStatusPayload {
  status: BookTrackerBookStatus;
}
