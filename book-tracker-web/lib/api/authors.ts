/**
 * BookTracker authors API client.
 *
 * Provides type-safe access to the /api/authors endpoints.
 */

import { apiClient, ApiError } from './client';
import type {
  BookTrackerFollowAuthorPayload,
  BookTrackerFollowedAuthor,
  BookTrackerBook,
} from '@/types';

/**
 * Follow an author.
 * @param payload - Follow details
 * @returns Followed author data
 */
export async function bookTrackerFollowAuthor(
  payload: BookTrackerFollowAuthorPayload,
): Promise<BookTrackerFollowedAuthor> {
  return apiClient<BookTrackerFollowedAuthor>('/api/authors/follow', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Unfollow an author.
 * @param authorName - Author name to unfollow
 */
export async function bookTrackerUnfollowAuthor(
  authorName: string,
): Promise<void> {
  try {
    await apiClient<void>(`/api/authors/follow/${encodeURIComponent(authorName)}`, {
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
 * List all followed authors.
 * @returns Array of followed authors
 */
export async function bookTrackerListFollowedAuthors(): Promise<BookTrackerFollowedAuthor[]> {
  return apiClient<BookTrackerFollowedAuthor[]>('/api/authors/following');
}

/**
 * Get all books by a specific author.
 * @param authorName - Author name
 * @returns Array of books
 */
export async function bookTrackerGetAuthorBooks(
  authorName: string,
): Promise<BookTrackerBook[]> {
  return apiClient<BookTrackerBook[]>(`/api/authors/${encodeURIComponent(authorName)}/books`);
}

/**
 * Convert a caught error into a user-friendly message for author operations.
 * @param caught - The error object
 * @returns Human-readable error message
 */
export function bookTrackerAuthorReadableError(caught: unknown): string {
  if (caught instanceof ApiError) {
    if (caught.status === 401) return 'Please sign in to continue.';
    if (caught.status === 404) return 'Resource not found.';
    return caught.message || 'An unexpected error occurred.';
  }
  return 'Something went wrong. Please try again.';
}
