/**
 * BookTracker reviews API client.
 *
 * Provides type-safe access to enhanced book review endpoints.
 */

import { apiClient, ApiError } from './client';
import type {
  BookTrackerBookReview,
  BookTrackerCreateReviewPayload,
  BookTrackerUpdateReviewPayload,
} from '@/types';

/**
 * Create a new review.
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
 * Get reviews for a specific book.
 */
export async function bookTrackerGetBookReviews(
  bookId: string,
): Promise<BookTrackerBookReview[]> {
  return apiClient<BookTrackerBookReview[]>(`/api/reviews/book/${bookId}`);
}

/**
 * Get reviews by a specific user.
 */
export async function bookTrackerGetUserReviews(
  userId: string,
): Promise<BookTrackerBookReview[]> {
  return apiClient<BookTrackerBookReview[]>(`/api/reviews/user/${userId}`);
}

/**
 * Update a review.
 */
export async function bookTrackerUpdateReview(
  reviewId: string,
  payload: BookTrackerUpdateReviewPayload,
): Promise<BookTrackerBookReview> {
  return apiClient<BookTrackerBookReview>(`/api/reviews/${reviewId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

/**
 * Delete a review.
 */
export async function bookTrackerDeleteReview(reviewId: string): Promise<void> {
  try {
    await apiClient<void>(`/api/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 0) {
      return;
    }
    throw error;
  }
}

/**
 * Maps API errors to user-friendly messages.
 */
export function bookTrackerReviewsReadableError(caught: unknown): string {
  if (caught instanceof ApiError) {
    if (caught.status === 404) return 'Review not found.';
    if (caught.status === 403) return 'Access denied.';
    if (caught.status === 401) return 'Please sign in.';
  }
  return 'Something went wrong. Please try again.';
}
