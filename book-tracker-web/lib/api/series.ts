/**
 * BookTracker series API client.
 *
 * Provides type-safe access to book series endpoints.
 */

import { apiClient, ApiError } from './client';
import type {
  BookTrackerBookSeries,
  BookTrackerCreateSeriesPayload,
} from '@/types';

/**
 * Get all series.
 */
export async function bookTrackerGetAllSeries(): Promise<BookTrackerBookSeries[]> {
  return apiClient<BookTrackerBookSeries[]>('/api/series');
}

/**
 * Get a specific series.
 */
export async function bookTrackerGetSeries(
  id: string,
): Promise<BookTrackerBookSeries> {
  return apiClient<BookTrackerBookSeries>(`/api/series/${id}`);
}

/**
 * Get series for a specific book.
 */
export async function bookTrackerGetSeriesByBook(
  bookId: string,
): Promise<BookTrackerBookSeries> {
  return apiClient<BookTrackerBookSeries>(`/api/series/book/${bookId}`);
}

/**
 * Create a new series.
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
 * Maps API errors to user-friendly messages.
 */
export function bookTrackerSeriesReadableError(caught: unknown): string {
  if (caught instanceof ApiError) {
    if (caught.status === 404) return 'Series not found.';
    if (caught.status === 401) return 'Please sign in.';
  }
  return 'Something went wrong. Please try again.';
}
