/**
 * BookTracker author following API client.
 *
 * Provides type-safe access to author following endpoints.
 */

import { apiClient, ApiError } from './client';
import type {
  BookTrackerFollowedAuthor,
  BookTrackerFollowAuthorPayload,
} from '@/types';

/**
 * Follow an author.
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
 */
export async function bookTrackerUnfollowAuthor(
  authorName: string,
): Promise<void> {
  try {
    await apiClient<void>(`/api/authors/follow/${encodeURIComponent(authorName)}`, {
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
 * Get followed authors.
 */
export async function bookTrackerGetFollowedAuthors(): Promise<BookTrackerFollowedAuthor[]> {
  return apiClient<BookTrackerFollowedAuthor[]>('/api/authors/following');
}

/**
 * Maps API errors to user-friendly messages.
 */
export function bookTrackerAuthorsReadableError(caught: unknown): string {
  if (caught instanceof ApiError) {
    if (caught.status === 400) return 'Invalid request.';
    if (caught.status === 401) return 'Please sign in.';
  }
  return 'Something went wrong. Please try again.';
}
