/**
 * BookTracker authentication gateway.
 *
 * Wraps every auth-related HTTP call so the rest of the application
 * never touches raw endpoints or status codes directly.
 */

import { apiClient, ApiError } from '@/lib/api/client';
import type {
  BookTrackerSignupPayload,
  BookTrackerCredentials,
  BookTrackerSessionData,
  BookTrackerAccount,
  BookTrackerErrorEnvelope,
} from '@/types';

/** Centralised route table for BookTracker auth endpoints. */
export const BOOK_TRACKER_AUTH_ROUTES = {
  register: '/api/auth/register',
  login: '/api/auth/login',
  logout: '/api/auth/logout',
  me: '/api/auth/me',
} as const;

/**
 * Map of HTTP status codes → reader-friendly messages surfaced in the
 * BookTracker UI when a specific status is returned by the auth API.
 */
const BOOK_TRACKER_STATUS_MESSAGES: Map<number, string> = new Map([
  [400, 'Some of the information you entered is not valid. Please double-check and try again.'],
  [401, 'The email or password you entered does not match our records.'],
  [409, 'An account with that email already exists in BookTracker.'],
  [423, 'This account has been temporarily locked. Please try again later.'],
  [0, 'Unable to reach the BookTracker server. Check your connection and try again.'],
]);

/**
 * Register a brand-new BookTracker account.
 *
 * @param payload - signup fields coming from the registration form
 * @returns session data including the freshly-minted JWT
 */
export async function bookTrackerSignup(
  payload: BookTrackerSignupPayload,
): Promise<BookTrackerSessionData> {
  return apiClient<BookTrackerSessionData>(BOOK_TRACKER_AUTH_ROUTES.register, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Authenticate an existing BookTracker user.
 *
 * @param creds - email + password (and optional rememberMe flag)
 * @returns session data with JWT
 */
export async function bookTrackerAuthenticate(
  creds: BookTrackerCredentials,
): Promise<BookTrackerSessionData> {
  return apiClient<BookTrackerSessionData>(BOOK_TRACKER_AUTH_ROUTES.login, {
    method: 'POST',
    body: JSON.stringify(creds),
  });
}

/**
 * Invalidate the current BookTracker session on the server.
 *
 * The backend returns 204 (no body), so we call `fetch` directly
 * rather than going through `apiClient` which always parses JSON.
 */
export async function bookTrackerEndSession(): Promise<void> {
  await apiClient<undefined>(BOOK_TRACKER_AUTH_ROUTES.logout, {
    method: 'POST',
  }).catch((err: unknown) => {
    // 204 triggers a JSON-parse failure inside apiClient — that is fine.
    if (err instanceof ApiError && err.status === 0) {
      return;
    }
    throw err;
  });
}

/**
 * Retrieve the identity of the currently-authenticated BookTracker user.
 *
 * @returns account info or throws if no valid session exists
 */
export async function bookTrackerWhoAmI(): Promise<BookTrackerAccount> {
  return apiClient<BookTrackerAccount>(BOOK_TRACKER_AUTH_ROUTES.me, {
    method: 'GET',
  });
}

/**
 * Convert a caught error (typically {@link ApiError}) into a single
 * human-readable string suitable for display in a BookTracker form banner.
 */
export function bookTrackerReadableError(caught: unknown): string {
  if (caught instanceof ApiError) {
    const envelope = caught.response as BookTrackerErrorEnvelope | undefined;
    if (envelope?.message) {
      return envelope.message;
    }
    return (
      BOOK_TRACKER_STATUS_MESSAGES.get(caught.status) ??
      'Something unexpected happened. Please try again.'
    );
  }

  if (caught instanceof Error) {
    return caught.message;
  }

  return 'An unknown problem occurred while contacting BookTracker.';
}
