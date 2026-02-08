/**
 * BookTracker statistics API client.
 *
 * Provides type-safe access to reading statistics endpoints.
 */

import { apiClient, ApiError } from './client';
import type {
  BookTrackerStatisticsOverview,
  BookTrackerMonthlyCount,
  BookTrackerGenreCount,
  BookTrackerAuthorCount,
} from '@/types';

/**
 * Get statistics overview.
 */
export async function bookTrackerGetStatisticsOverview(): Promise<BookTrackerStatisticsOverview> {
  return apiClient<BookTrackerStatisticsOverview>('/api/statistics/overview');
}

/**
 * Get books read per month for a year.
 */
export async function bookTrackerGetBooksByMonth(
  year?: number,
): Promise<BookTrackerMonthlyCount[]> {
  const query = year ? `?year=${year}` : '';
  return apiClient<BookTrackerMonthlyCount[]>(`/api/statistics/reading-by-month${query}`);
}

/**
 * Get genre distribution.
 */
export async function bookTrackerGetGenreDistribution(): Promise<BookTrackerGenreCount[]> {
  return apiClient<BookTrackerGenreCount[]>('/api/statistics/genre-distribution');
}

/**
 * Get most-read authors.
 */
export async function bookTrackerGetMostReadAuthors(): Promise<BookTrackerAuthorCount[]> {
  return apiClient<BookTrackerAuthorCount[]>('/api/statistics/authors-most-read');
}

/**
 * Maps API errors to user-friendly messages.
 */
export function bookTrackerStatisticsReadableError(caught: unknown): string {
  if (caught instanceof ApiError) {
    if (caught.status === 401) return 'Please sign in.';
  }
  return 'Something went wrong. Please try again.';
}
