/**
 * BookTracker statistics API client.
 *
 * Provides type-safe access to the /api/statistics endpoints.
 */

import { apiClient, ApiError } from './client';
import type {
  BookTrackerStatsOverview,
  BookTrackerMonthlyReading,
  BookTrackerGenreDistribution,
  BookTrackerAuthorReadCount,
} from '@/types';

/**
 * Get an overview of reading statistics.
 * @returns Statistics overview data
 */
export async function bookTrackerGetStatsOverview(): Promise<BookTrackerStatsOverview> {
  return apiClient<BookTrackerStatsOverview>('/api/statistics/overview');
}

/**
 * Get monthly reading counts for a given year.
 * @param year - Target year
 * @returns Array of monthly reading counts
 */
export async function bookTrackerGetMonthlyReading(
  year: number,
): Promise<BookTrackerMonthlyReading[]> {
  return apiClient<BookTrackerMonthlyReading[]>(`/api/statistics/reading-by-month?year=${year}`);
}

/**
 * Get genre distribution across the user's library.
 * @returns Array of genre distribution items
 */
export async function bookTrackerGetGenreDistribution(): Promise<BookTrackerGenreDistribution[]> {
  return apiClient<BookTrackerGenreDistribution[]>('/api/statistics/genre-distribution');
}

/**
 * Get the most-read authors.
 * @returns Array of author read counts
 */
export async function bookTrackerGetTopAuthors(): Promise<BookTrackerAuthorReadCount[]> {
  return apiClient<BookTrackerAuthorReadCount[]>('/api/statistics/authors-most-read');
}

/**
 * Convert a caught error into a user-friendly message for statistics operations.
 * @param caught - The error object
 * @returns Human-readable error message
 */
export function bookTrackerStatsReadableError(caught: unknown): string {
  if (caught instanceof ApiError) {
    if (caught.status === 401) return 'Please sign in to continue.';
    if (caught.status === 404) return 'Resource not found.';
    return caught.message || 'An unexpected error occurred.';
  }
  return 'Something went wrong. Please try again.';
}
