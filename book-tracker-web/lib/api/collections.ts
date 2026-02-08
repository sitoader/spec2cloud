/**
 * BookTracker collections API client.
 *
 * Provides type-safe access to collection management endpoints.
 */

import { apiClient, ApiError } from './client';
import type {
  BookTrackerCollection,
  BookTrackerCreateCollectionPayload,
  BookTrackerUpdateCollectionPayload,
  BookTrackerAddBookToCollectionPayload,
  BookTrackerCollectionBook,
} from '@/types';

/**
 * Get user's collections.
 */
export async function bookTrackerGetCollections(): Promise<BookTrackerCollection[]> {
  return apiClient<BookTrackerCollection[]>('/api/collections');
}

/**
 * Create a new collection.
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
 * Get a specific collection.
 */
export async function bookTrackerGetCollection(
  id: string,
): Promise<BookTrackerCollection> {
  return apiClient<BookTrackerCollection>(`/api/collections/${id}`);
}

/**
 * Update a collection.
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
 */
export async function bookTrackerDeleteCollection(id: string): Promise<void> {
  try {
    await apiClient<void>(`/api/collections/${id}`, {
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
 * Add a book to a collection.
 */
export async function bookTrackerAddBookToCollection(
  collectionId: string,
  payload: BookTrackerAddBookToCollectionPayload,
): Promise<BookTrackerCollectionBook> {
  return apiClient<BookTrackerCollectionBook>(`/api/collections/${collectionId}/books`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Remove a book from a collection.
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
    if (error instanceof ApiError && error.status === 0) {
      return;
    }
    throw error;
  }
}

/**
 * Get public collections.
 */
export async function bookTrackerGetPublicCollections(
  search?: string,
): Promise<BookTrackerCollection[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return apiClient<BookTrackerCollection[]>(`/api/collections/public${query}`);
}

/**
 * Maps API errors to user-friendly messages.
 */
export function bookTrackerCollectionsReadableError(caught: unknown): string {
  if (caught instanceof ApiError) {
    if (caught.status === 404) return 'Collection not found.';
    if (caught.status === 403) return 'Access denied.';
    if (caught.status === 401) return 'Please sign in.';
  }
  return 'Something went wrong. Please try again.';
}
