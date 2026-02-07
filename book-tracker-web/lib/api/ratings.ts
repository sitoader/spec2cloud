/**
 * BookTracker ratings API client.
 *
 * Provides type-safe access to the /api/books/{bookId}/rating endpoints.
 */

import { apiClient, ApiError } from './client';
import type { BookTrackerRating } from '@/types';

/**
 * Add or update a rating for a book.
 * @param bookId - Book ID
 * @param score - Rating score (1-5)
 * @param notes - Optional review notes (max 1000 chars)
 * @returns Updated rating
 */
export async function bookTrackerAddOrUpdateRating(
  bookId: string,
  score: number,
  notes?: string,
): Promise<BookTrackerRating> {
  return apiClient<BookTrackerRating>(`/api/books/${bookId}/rating`, {
    method: 'POST',
    body: JSON.stringify({ score, notes }),
  });
}

/**
 * Delete a rating for a book.
 * @param bookId - Book ID
 */
export async function bookTrackerDeleteRating(bookId: string): Promise<void> {
  try {
    await apiClient<void>(`/api/books/${bookId}/rating`, {
      method: 'DELETE',
    });
  } catch (error) {
    // API returns 204 No Content which causes JSON parse error (status === 0)
    if (error instanceof ApiError && error.status === 0) {
      return;
    }
    throw error;
  }
}
