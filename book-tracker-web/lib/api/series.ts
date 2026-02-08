/**
 * BookTracker series API client.
 *
 * Provides type-safe access to the /api/series endpoints.
 */

import { apiClient, ApiError } from './client';
import type {
  BookTrackerBookSeries,
  BookTrackerCreateSeriesPayload,
} from '@/types';

/**
 * List all book series.
 * @returns Array of book series
 */
export async function bookTrackerListSeries(): Promise<BookTrackerBookSeries[]> {
  return apiClient<BookTrackerBookSeries[]>('/api/series');
}

/**
 * Get a single book series by ID.
 * @param id - Series ID
 * @returns Book series data
 */
export async function bookTrackerGetSeries(
  id: string,
): Promise<BookTrackerBookSeries> {
  return apiClient<BookTrackerBookSeries>(`/api/series/${id}`);
}

/**
 * Get the series containing a specific book.
 * @param bookId - Book ID
 * @returns Book series data
 */
export async function bookTrackerGetSeriesByBook(
  bookId: string,
): Promise<BookTrackerBookSeries> {
  return apiClient<BookTrackerBookSeries>(`/api/series/book/${bookId}`);
}

/**
 * Create a new book series.
 * @param payload - Series details
 * @returns Created book series
 */
export async function bookTrackerCreateSeries(
  payload: BookTrackerCreateSeriesPayload,
): Promise<BookTrackerBookSeries> {
  return apiClient<BookTrackerBookSeries>('/api/series', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Convert a caught error into a user-friendly message for series operations.
 * @param caught - The error object
 * @returns Human-readable error message
 */
export function bookTrackerSeriesReadableError(caught: unknown): string {
  if (caught instanceof ApiError) {
    if (caught.status === 401) return 'Please sign in to continue.';
    if (caught.status === 404) return 'Resource not found.';
    return caught.message || 'An unexpected error occurred.';
  }
  return 'Something went wrong. Please try again.';
}
