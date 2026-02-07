/**
 * BookTracker books API client.
 *
 * Provides type-safe access to the /api/books endpoints.
 */

import { apiClient, ApiError } from './client';
import type {
  BookTrackerBook,
  BookTrackerBooksResponse,
  BookTrackerAddBookPayload,
  BookTrackerUpdateBookPayload,
  BookTrackerUpdateBookStatusPayload,
  BookTrackerBookStatus,
} from '@/types';

/**
 * Fetch books from the user's library.
 * @param status - Optional filter by book status
 * @param page - Page number (default: 1)
 * @param pageSize - Items per page (default: 20)
 * @returns Paginated books response
 */
export async function bookTrackerGetBooks(
  status?: BookTrackerBookStatus,
  page: number = 1,
  pageSize: number = 20
): Promise<BookTrackerBooksResponse> {
  const params = new URLSearchParams();
  if (status !== undefined) {
    params.append('status', status.toString());
  }
  params.append('page', page.toString());
  params.append('pageSize', pageSize.toString());

  const query = params.toString();
  const endpoint = query ? `/api/books?${query}` : '/api/books';

  return apiClient<BookTrackerBooksResponse>(endpoint);
}

/**
 * Fetch a single book by ID.
 * @param id - Book ID
 * @returns Book details
 */
export async function bookTrackerGetBook(id: string): Promise<BookTrackerBook> {
  return apiClient<BookTrackerBook>(`/api/books/${id}`);
}

/**
 * Add a new book to the library.
 * @param payload - Book details
 * @returns Created book
 */
export async function bookTrackerAddBook(
  payload: BookTrackerAddBookPayload
): Promise<BookTrackerBook> {
  return apiClient<BookTrackerBook>('/api/books', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Update an existing book.
 * @param id - Book ID
 * @param payload - Updated fields
 * @returns Updated book
 */
export async function bookTrackerUpdateBook(
  id: string,
  payload: BookTrackerUpdateBookPayload
): Promise<BookTrackerBook> {
  return apiClient<BookTrackerBook>(`/api/books/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

/**
 * Update book status.
 * @param id - Book ID
 * @param status - New status
 * @returns Updated book
 */
export async function bookTrackerUpdateBookStatus(
  id: string,
  status: BookTrackerBookStatus
): Promise<BookTrackerBook> {
  const payload: BookTrackerUpdateBookStatusPayload = { status };
  return apiClient<BookTrackerBook>(`/api/books/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

/**
 * Delete a book from the library.
 * @param id - Book ID
 */
export async function bookTrackerDeleteBook(id: string): Promise<void> {
  try {
    await apiClient<void>(`/api/books/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 204) {
      return;
    }
    throw error;
  }
}
