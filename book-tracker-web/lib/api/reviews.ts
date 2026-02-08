/**
 * BookTracker reviews API client.
 *
 * Provides type-safe access to the /api/reviews endpoints.
 */

import { apiClient, ApiError } from './client';
import type {
  BookTrackerBookReview,
  BookTrackerCreateReviewPayload,
  BookTrackerUpdateReviewPayload,
} from '@/types';

/**
 * Create a new book review.
 * @param payload - Review details
 * @returns Created review
 */
export async function bookTrackerCreateReview(
  payload: BookTrackerCreateReviewPayload,
): Promise<BookTrackerBookReview> {
  return apiClient<BookTrackerBookReview>('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Get all reviews for a specific book.
 * @param bookId - Book ID
 * @returns Array of book reviews
 */
export async function bookTrackerGetBookReviews(
  bookId: string,
): Promise<BookTrackerBookReview[]> {
  return apiClient<BookTrackerBookReview[]>(`/api/reviews/book/${bookId}`);
}

/**
 * Get all reviews by a specific user.
 * @param userId - User ID
 * @returns Array of book reviews
 */
export async function bookTrackerGetUserReviews(
  userId: string,
): Promise<BookTrackerBookReview[]> {
  return apiClient<BookTrackerBookReview[]>(`/api/reviews/user/${userId}`);
}

/**
 * Update an existing review.
 * @param id - Review ID
 * @param payload - Updated review data
 * @returns Updated review
 */
export async function bookTrackerUpdateReview(
  id: string,
  payload: BookTrackerUpdateReviewPayload,
): Promise<BookTrackerBookReview> {
  return apiClient<BookTrackerBookReview>(`/api/reviews/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

/**
 * Delete a review.
 * @param id - Review ID
 */
export async function bookTrackerDeleteReview(id: string): Promise<void> {
  try {
    await apiClient<void>(`/api/reviews/${id}`, {
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

/**
 * Convert a caught error into a user-friendly message for review operations.
 * @param caught - The error object
 * @returns Human-readable error message
 */
export function bookTrackerReviewReadableError(caught: unknown): string {
  if (caught instanceof ApiError) {
    if (caught.status === 401) return 'Please sign in to continue.';
    if (caught.status === 404) return 'Resource not found.';
    return caught.message || 'An unexpected error occurred.';
  }
  return 'Something went wrong. Please try again.';
}
