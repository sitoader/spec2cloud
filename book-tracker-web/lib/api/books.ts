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
  BookTrackerErrorEnvelope,
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
    // API returns 204 No Content which causes JSON parse error (status === 0)
    if (error instanceof ApiError && error.status === 0) {
      return;
    }
    throw error;
  }
}

/**
 * Map of HTTP status codes to user-friendly error messages for book operations.
 */
const BOOK_STATUS_MESSAGES: Map<number, string> = new Map([
  [0, 'Unable to reach the server. Check your connection and try again.'],
  [400, 'Invalid book information. Please check your input and try again.'],
  [401, 'You need to be logged in to perform this action.'],
  [403, 'You do not have permission to access this book.'],
  [404, 'Book not found.'],
  [409, 'A book with this title already exists in your library.'],
]);

/**
 * Convert a caught error into a user-friendly message for book operations.
 * @param caught - The error object
 * @returns Human-readable error message
 */
export function bookTrackerReadableError(caught: unknown): string {
  if (caught instanceof ApiError) {
    const envelope = caught.response as BookTrackerErrorEnvelope | undefined;
    if (envelope?.message) {
      return envelope.message;
    }
    return (
      BOOK_STATUS_MESSAGES.get(caught.status) ??
      'Something unexpected happened. Please try again.'
    );
  }

  if (caught instanceof Error) {
    return caught.message;
  }

  return 'An unknown problem occurred.';
}
