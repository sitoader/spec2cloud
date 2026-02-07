import {
  BOOK_TRACKER_AUTH_ROUTES,
  bookTrackerSignup,
  bookTrackerAuthenticate,
  bookTrackerEndSession,
  bookTrackerWhoAmI,
  bookTrackerReadableError,
} from './auth';
import { apiClient, ApiError } from '@/lib/api/client';
import type {
  BookTrackerSignupPayload,
  BookTrackerCredentials,
  BookTrackerSessionData,
  BookTrackerAccount,
} from '@/types';

jest.mock('@/lib/api/client', () => {
  const ActualApiError = jest.requireActual<typeof import('@/lib/api/client')>(
    '@/lib/api/client',
  ).ApiError;
  return {
    apiClient: jest.fn(),
    ApiError: ActualApiError,
  };
});

const mockedApiClient = apiClient as jest.Mock;

describe('BOOK_TRACKER_AUTH_ROUTES', () => {
  it('exposes the expected route paths', () => {
    expect(BOOK_TRACKER_AUTH_ROUTES).toEqual({
      register: '/api/auth/register',
      login: '/api/auth/login',
      logout: '/api/auth/logout',
      me: '/api/auth/me',
    });
  });
});

describe('bookTrackerSignup', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls apiClient with the register route, POST method, and stringified payload', async () => {
    const payload: BookTrackerSignupPayload = {
      email: 'reader@booktracker.test',
      password: 'SecurePass1',
      displayName: 'Avid Reader',
    };
    const session: BookTrackerSessionData = {
      userId: 'u-001',
      email: payload.email,
      displayName: 'Avid Reader',
      token: 'jwt-signup-token',
      expiresAt: '2099-01-01T00:00:00Z',
    };
    mockedApiClient.mockResolvedValueOnce(session);

    const result = await bookTrackerSignup(payload);

    expect(mockedApiClient).toHaveBeenCalledWith(
      BOOK_TRACKER_AUTH_ROUTES.register,
      { method: 'POST', body: JSON.stringify(payload) },
    );
    expect(result).toEqual(session);
  });
});

describe('bookTrackerAuthenticate', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls apiClient with the login route, POST method, and stringified credentials', async () => {
    const creds: BookTrackerCredentials = {
      email: 'reader@booktracker.test',
      password: 'SecurePass1',
      rememberMe: true,
    };
    const session: BookTrackerSessionData = {
      userId: 'u-002',
      email: creds.email,
      displayName: 'Reader',
      token: 'jwt-login-token',
      expiresAt: '2099-06-15T00:00:00Z',
    };
    mockedApiClient.mockResolvedValueOnce(session);

    const result = await bookTrackerAuthenticate(creds);

    expect(mockedApiClient).toHaveBeenCalledWith(
      BOOK_TRACKER_AUTH_ROUTES.login,
      { method: 'POST', body: JSON.stringify(creds) },
    );
    expect(result).toEqual(session);
  });
});

describe('bookTrackerEndSession', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls apiClient with the logout route and POST method', async () => {
    mockedApiClient.mockResolvedValueOnce(undefined);

    await bookTrackerEndSession();

    expect(mockedApiClient).toHaveBeenCalledWith(
      BOOK_TRACKER_AUTH_ROUTES.logout,
      { method: 'POST' },
    );
  });

  it('swallows ApiError with status 0 (JSON-parse on 204)', async () => {
    mockedApiClient.mockRejectedValueOnce(new ApiError('empty body', 0));

    await expect(bookTrackerEndSession()).resolves.toBeUndefined();
  });

  it('rethrows ApiError when the status is not 0', async () => {
    const serverErr = new ApiError('server error', 500);
    mockedApiClient.mockRejectedValueOnce(serverErr);

    await expect(bookTrackerEndSession()).rejects.toThrow(serverErr);
  });

  it('rethrows non-ApiError exceptions', async () => {
    mockedApiClient.mockRejectedValueOnce(new TypeError('unexpected'));

    await expect(bookTrackerEndSession()).rejects.toThrow('unexpected');
  });
});

describe('bookTrackerWhoAmI', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls apiClient with the me route and GET method', async () => {
    const account: BookTrackerAccount = {
      userId: 'u-003',
      email: 'librarian@booktracker.test',
      displayName: 'Librarian',
    };
    mockedApiClient.mockResolvedValueOnce(account);

    const result = await bookTrackerWhoAmI();

    expect(mockedApiClient).toHaveBeenCalledWith(
      BOOK_TRACKER_AUTH_ROUTES.me,
      { method: 'GET' },
    );
    expect(result).toEqual(account);
  });
});

describe('bookTrackerReadableError', () => {
  it('returns the envelope message when ApiError carries a body with message', () => {
    const err = new ApiError('HTTP 409', 409, {
      message: 'Duplicate account detected by BookTracker',
    });
    expect(bookTrackerReadableError(err)).toBe(
      'Duplicate account detected by BookTracker',
    );
  });

  it('returns the mapped status message when no envelope message exists', () => {
    const err = new ApiError('HTTP 401', 401);
    expect(bookTrackerReadableError(err)).toBe(
      'The email or password you entered does not match our records.',
    );
  });

  it('returns status-0 message for network-level ApiErrors', () => {
    const err = new ApiError('network fail', 0);
    expect(bookTrackerReadableError(err)).toBe(
      'Unable to reach the BookTracker server. Check your connection and try again.',
    );
  });

  it('falls back to generic message for unmapped status codes', () => {
    const err = new ApiError('HTTP 502', 502);
    expect(bookTrackerReadableError(err)).toBe(
      'Something unexpected happened. Please try again.',
    );
  });

  it('returns the message property for plain Error instances', () => {
    expect(bookTrackerReadableError(new Error('timeout reached'))).toBe(
      'timeout reached',
    );
  });

  it('returns the unknown-problem string for non-error values', () => {
    expect(bookTrackerReadableError('oops')).toBe(
      'An unknown problem occurred while contacting BookTracker.',
    );
    expect(bookTrackerReadableError(42)).toBe(
      'An unknown problem occurred while contacting BookTracker.',
    );
    expect(bookTrackerReadableError(null)).toBe(
      'An unknown problem occurred while contacting BookTracker.',
    );
  });
});
