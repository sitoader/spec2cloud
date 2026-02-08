/**
 * BookTracker reading progress API client.
 *
 * Provides type-safe access to reading progress, sessions, and streak endpoints.
 */

import { apiClient, ApiError } from './client';
import type {
  BookTrackerReadingSession,
  BookTrackerLogSessionPayload,
  BookTrackerReadingProgress,
  BookTrackerUpdateProgressPayload,
  BookTrackerReadingStreak,
} from '@/types';

/**
 * Log a new reading session.
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
 * Get reading sessions, optionally filtered by book and date range.
 */
export async function bookTrackerGetSessions(
  bookId?: string,
  startDate?: string,
  endDate?: string,
): Promise<BookTrackerReadingSession[]> {
  const params = new URLSearchParams();
  if (bookId) params.set('bookId', bookId);
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  const query = params.toString();
  return apiClient<BookTrackerReadingSession[]>(`/api/reading-sessions${query ? `?${query}` : ''}`);
}

/**
 * Get reading progress for a book.
 */
export async function bookTrackerGetProgress(
  bookId: string,
): Promise<BookTrackerReadingProgress> {
  return apiClient<BookTrackerReadingProgress>(`/api/reading-progress/${bookId}`);
}

/**
 * Update reading progress for a book.
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
 */
export async function bookTrackerGetStreak(): Promise<BookTrackerReadingStreak> {
  return apiClient<BookTrackerReadingStreak>('/api/reading-streak');
}

/**
 * Maps API errors to user-friendly messages.
 */
export function bookTrackerProgressReadableError(caught: unknown): string {
  if (caught instanceof ApiError) {
    if (caught.status === 404) return 'Not found.';
    if (caught.status === 403) return 'Access denied.';
    if (caught.status === 401) return 'Please sign in.';
  }
  return 'Something went wrong. Please try again.';
}
