/**
 * BookTracker reading progress API client.
 *
 * Provides type-safe access to the /api/reading-sessions,
 * /api/reading-progress, and /api/reading-streak endpoints.
 */

import { apiClient, ApiError } from './client';
import type {
  BookTrackerLogSessionPayload,
  BookTrackerReadingSession,
  BookTrackerUpdateProgressPayload,
  BookTrackerReadingProgress,
  BookTrackerReadingStreak,
} from '@/types';

/**
 * Log a new reading session.
 * @param payload - Session details
 * @returns Created reading session
 */
export async function bookTrackerLogSession(
  payload: BookTrackerLogSessionPayload,
): Promise<BookTrackerReadingSession> {
  return apiClient<BookTrackerReadingSession>('/api/reading-sessions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * List reading sessions with optional filters.
 * @param bookId - Optional book ID filter
 * @param startDate - Optional start date filter (ISO 8601)
 * @param endDate - Optional end date filter (ISO 8601)
 * @returns Array of reading sessions
 */
export async function bookTrackerListSessions(
  bookId?: string,
  startDate?: string,
  endDate?: string,
): Promise<BookTrackerReadingSession[]> {
  const params = new URLSearchParams();
  if (bookId) params.append('bookId', bookId);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const query = params.toString();
  const endpoint = query ? `/api/reading-sessions?${query}` : '/api/reading-sessions';

  return apiClient<BookTrackerReadingSession[]>(endpoint);
}

/**
 * Get reading progress for a book.
 * @param bookId - Book ID
 * @returns Reading progress data
 */
export async function bookTrackerGetProgress(
  bookId: string,
): Promise<BookTrackerReadingProgress> {
  return apiClient<BookTrackerReadingProgress>(`/api/reading-progress/${bookId}`);
}

/**
 * Update reading progress for a book.
 * @param bookId - Book ID
 * @param payload - Progress update data
 * @returns Updated reading progress
 */
export async function bookTrackerUpdateProgress(
  bookId: string,
  payload: BookTrackerUpdateProgressPayload,
): Promise<BookTrackerReadingProgress> {
  return apiClient<BookTrackerReadingProgress>(`/api/reading-progress/${bookId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

/**
 * Get the current reading streak.
 * @returns Reading streak data
 */
export async function bookTrackerGetStreak(): Promise<BookTrackerReadingStreak> {
  return apiClient<BookTrackerReadingStreak>('/api/reading-streak');
}

/**
 * Convert a caught error into a user-friendly message for progress operations.
 * @param caught - The error object
 * @returns Human-readable error message
 */
export function bookTrackerProgressReadableError(caught: unknown): string {
  if (caught instanceof ApiError) {
    if (caught.status === 401) return 'Please sign in to continue.';
    if (caught.status === 404) return 'Resource not found.';
    return caught.message || 'An unexpected error occurred.';
  }
  return 'Something went wrong. Please try again.';
}
