/**
 * BookTracker external-catalogue search client.
 *
 * Wraps the /api/search route group, which queries Google Books
 * and Open Library behind the scenes.
 */

import { apiClient, ApiError } from './client';
import type {
  BookTrackerExternalBook,
  BookTrackerErrorEnvelope,
} from '@/types';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SEARCH_ENDPOINT = '/api/search/books';
const DEFAULT_RESULT_CAP = 10;

const FRIENDLY_MESSAGES: ReadonlyMap<number, string> = new Map([
  [400, 'Search query must be at least 3 characters.'],
  [401, 'Please sign in to search for books.'],
  [503, 'External book services are temporarily unavailable.'],
]);

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Query external book catalogues for matching titles.
 *
 * The backend enforces a minimum query length of 3 characters and
 * clamps `resultCap` to the 1–20 range.
 */
export async function bookTrackerSearchBooks(
  searchPhrase: string,
  resultCap: number = DEFAULT_RESULT_CAP,
): Promise<BookTrackerExternalBook[]> {
  const qs = new URLSearchParams({
    query: searchPhrase,
    maxResults: String(resultCap),
  });

  return apiClient<BookTrackerExternalBook[]>(`${SEARCH_ENDPOINT}?${qs}`);
}

/**
 * Turn a caught search error into a display-friendly message.
 */
export function bookTrackerSearchReadableError(caught: unknown): string {
  if (caught instanceof ApiError) {
    const envelope = caught.response as BookTrackerErrorEnvelope | undefined;
    if (envelope?.message) return envelope.message;
    return (
      FRIENDLY_MESSAGES.get(caught.status) ??
      'Something went wrong while searching. Please try again.'
    );
  }
  if (caught instanceof Error) return caught.message;
  return 'An unexpected error occurred.';
}
