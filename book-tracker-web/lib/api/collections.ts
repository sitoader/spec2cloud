/**
 * BookTracker collections API client.
 *
 * Provides type-safe access to the /api/collections endpoints.
 */

import { apiClient, ApiError } from './client';
import type {
  BookTrackerCollection,
  BookTrackerCreateCollectionPayload,
  BookTrackerUpdateCollectionPayload,
  BookTrackerAddCollectionBookPayload,
} from '@/types';

/**
 * List all collections for the current user.
 * @returns Array of collections
 */
export async function bookTrackerListCollections(): Promise<BookTrackerCollection[]> {
  return apiClient<BookTrackerCollection[]>('/api/collections');
}

/**
 * Get a single collection by ID.
 * @param id - Collection ID
 * @returns Collection data
 */
export async function bookTrackerGetCollection(
  id: string,
): Promise<BookTrackerCollection> {
  return apiClient<BookTrackerCollection>(`/api/collections/${id}`);
}

/**
 * Create a new collection.
 * @param payload - Collection details
 * @returns Created collection
 */
export async function bookTrackerCreateCollection(
  payload: BookTrackerCreateCollectionPayload,
): Promise<BookTrackerCollection> {
  return apiClient<BookTrackerCollection>('/api/collections', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Update an existing collection.
 * @param id - Collection ID
 * @param payload - Updated collection data
 * @returns Updated collection
 */
export async function bookTrackerUpdateCollection(
  id: string,
  payload: BookTrackerUpdateCollectionPayload,
): Promise<BookTrackerCollection> {
  return apiClient<BookTrackerCollection>(`/api/collections/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

/**
 * Delete a collection.
 * @param id - Collection ID
 */
export async function bookTrackerDeleteCollection(id: string): Promise<void> {
  try {
    await apiClient<void>(`/api/collections/${id}`, {
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
 * Add a book to a collection.
 * @param collectionId - Collection ID
 * @param payload - Book to add
 */
export async function bookTrackerAddBookToCollection(
  collectionId: string,
  payload: BookTrackerAddCollectionBookPayload,
): Promise<void> {
  await apiClient<void>(`/api/collections/${collectionId}/books`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Remove a book from a collection.
 * @param collectionId - Collection ID
 * @param bookId - Book ID
 */
export async function bookTrackerRemoveBookFromCollection(
  collectionId: string,
  bookId: string,
): Promise<void> {
  try {
    await apiClient<void>(`/api/collections/${collectionId}/books/${bookId}`, {
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
 * Browse public collections with optional search.
 * @param search - Optional search query
 * @returns Array of public collections
 */
export async function bookTrackerBrowsePublicCollections(
  search?: string,
): Promise<BookTrackerCollection[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);

  const query = params.toString();
  const endpoint = query ? `/api/collections/public?${query}` : '/api/collections/public';

  return apiClient<BookTrackerCollection[]>(endpoint);
}

/**
 * Convert a caught error into a user-friendly message for collection operations.
 * @param caught - The error object
 * @returns Human-readable error message
 */
export function bookTrackerCollectionReadableError(caught: unknown): string {
  if (caught instanceof ApiError) {
    if (caught.status === 401) return 'Please sign in to continue.';
    if (caught.status === 404) return 'Resource not found.';
    return caught.message || 'An unexpected error occurred.';
  }
  return 'Something went wrong. Please try again.';
}
