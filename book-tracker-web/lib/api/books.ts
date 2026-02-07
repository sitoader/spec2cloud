/**
 * BookTracker book library gateway.
 *
 * Wraps every book-related HTTP call so the rest of the application
 * never touches raw endpoints or status codes directly.
 */

import { apiClient, ApiError } from '@/lib/api/client';
import type {
  BookTrackerBook,
  BookTrackerBookListResponse,
  BookTrackerBookStatus,
  BookTrackerAddBookPayload,
  BookTrackerUpdateBookPayload,
  BookTrackerUpdateStatusPayload,
  BookTrackerErrorEnvelope,
} from '@/types';

/** Centralised route table for BookTracker book endpoints. */
export const BOOK_TRACKER_BOOK_ROUTES = {
  list: '/api/books',
  detail: (id: string): string => `/api/books/${id}`,
  updateStatus: (id: string): string => `/api/books/${id}/status`,
} as const;

/**
 * Fetch the authenticated user's books with optional status filter and pagination.
 */
export async function bookTrackerGetBooks(
  status?: BookTrackerBookStatus,
  page = 1,
  pageSize = 20,
): Promise<BookTrackerBookListResponse> {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));

  const qs = params.toString();
  return apiClient<BookTrackerBookListResponse>(
    `${BOOK_TRACKER_BOOK_ROUTES.list}?${qs}`,
  );
}

/**
 * Fetch a single book by its ID.
 */
export async function bookTrackerGetBook(
  id: string,
): Promise<BookTrackerBook> {
  return apiClient<BookTrackerBook>(BOOK_TRACKER_BOOK_ROUTES.detail(id));
}

/**
 * Add a new book to the user's library.
 */
export async function bookTrackerAddBook(
  payload: BookTrackerAddBookPayload,
): Promise<BookTrackerBook> {
  return apiClient<BookTrackerBook>(BOOK_TRACKER_BOOK_ROUTES.list, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Update an existing book's metadata.
 */
export async function bookTrackerUpdateBook(
  id: string,
  payload: BookTrackerUpdateBookPayload,
): Promise<BookTrackerBook> {
  return apiClient<BookTrackerBook>(BOOK_TRACKER_BOOK_ROUTES.detail(id), {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

/**
 * Change just the reading status of a book.
 */
export async function bookTrackerUpdateBookStatus(
  id: string,
  payload: BookTrackerUpdateStatusPayload,
): Promise<BookTrackerBook> {
  return apiClient<BookTrackerBook>(BOOK_TRACKER_BOOK_ROUTES.updateStatus(id), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

/**
 * Delete a book from the user's library.
 *
 * The backend returns 204 (no body). Because `apiClient` unconditionally
 * calls `response.json()`, the empty body causes a SyntaxError that gets
 * wrapped as an `ApiError` with `status === 0`. We swallow that case.
 */
export async function bookTrackerDeleteBook(id: string): Promise<void> {
  await apiClient<undefined>(BOOK_TRACKER_BOOK_ROUTES.detail(id), {
    method: 'DELETE',
  }).catch((err: unknown) => {
    if (err instanceof ApiError && err.status === 0) {
      return;
    }
    throw err;
  });
}

/**
 * Convert a caught error into a human-readable string for book operations.
 */
export function bookTrackerBookReadableError(caught: unknown): string {
  if (caught instanceof ApiError) {
    const envelope = caught.response as BookTrackerErrorEnvelope | undefined;
    if (envelope?.message) {
      return envelope.message;
    }
    if (caught.status === 404) {
      return 'Book not found.';
    }
    if (caught.status === 409) {
      return 'A book with this ISBN already exists in your library.';
    }
    if (caught.status === 403) {
      return 'You do not have permission to access this book.';
    }
    return 'Something unexpected happened. Please try again.';
  }

  if (caught instanceof Error) {
    return caught.message;
  }

  return 'An unknown problem occurred while contacting BookTracker.';
}
