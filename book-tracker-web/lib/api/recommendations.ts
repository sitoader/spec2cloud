/**
 * BookTracker AI recommendations API client.
 *
 * Wraps the /api/recommendations route group for generating
 * AI-powered book recommendations.
 */

import { apiClient, ApiError } from './client';
import type {
  BookTrackerRecommendationsResponse,
  BookTrackerErrorEnvelope,
} from '@/types';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const GENERATE_ENDPOINT = '/api/recommendations/generate';

const FRIENDLY_MESSAGES: ReadonlyMap<number, string> = new Map([
  [400, 'You need at least 3 rated books to generate recommendations.'],
  [401, 'Please sign in to get recommendations.'],
  [429, "You've reached today's limit (10). Try again tomorrow."],
  [503, 'AI service is currently unavailable. Please try again later.'],
]);

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Generate AI-powered book recommendations.
 *
 * Calls POST /api/recommendations/generate with an optional count
 * parameter (1–10, defaults to 10 on the server).
 */
export async function bookTrackerGenerateRecommendations(
  count?: number,
): Promise<BookTrackerRecommendationsResponse> {
  return apiClient<BookTrackerRecommendationsResponse>(GENERATE_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({ count: count ?? 10 }),
  });
}

/**
 * Turn a caught recommendation error into a display-friendly message.
 */
export function bookTrackerRecommendationsReadableError(caught: unknown): string {
  if (caught instanceof ApiError) {
    const envelope = caught.response as BookTrackerErrorEnvelope | undefined;
    if (envelope?.message) return envelope.message;
    return (
      FRIENDLY_MESSAGES.get(caught.status) ??
      'Something went wrong while generating recommendations. Please try again.'
    );
  }
  if (caught instanceof Error) return caught.message;
  return 'An unexpected error occurred.';
}

/**
 * Check whether a caught error is a rate-limit (HTTP 429) response.
 */
export function bookTrackerIsRateLimited(caught: unknown): boolean {
  return caught instanceof ApiError && caught.status === 429;
}
