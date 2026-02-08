/**
 * Test suite for BookTracker authors API client functions.
 */

import {
  bookTrackerFollowAuthor,
  bookTrackerUnfollowAuthor,
  bookTrackerGetFollowedAuthors,
  bookTrackerAuthorsReadableError,
} from './authors';
import { apiClient, ApiError } from './client';
import type { BookTrackerFollowedAuthor } from '@/types';

jest.mock('./client', () => {
  const ActualApiError = jest.requireActual<typeof import('./client')>(
    './client',
  ).ApiError;
  return {
    apiClient: jest.fn(),
    ApiError: ActualApiError,
  };
});

const mockApiClient = apiClient as jest.MockedFunction<typeof apiClient>;

describe('bookTrackerFollowAuthor', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('should POST to follow an author', async () => {
    const mockFollowed: BookTrackerFollowedAuthor = {
      id: 'fa-1', authorName: 'Brandon Sanderson', followedAt: '', notificationsEnabled: true,
    };
    mockApiClient.mockResolvedValueOnce(mockFollowed);

    const result = await bookTrackerFollowAuthor({ authorName: 'Brandon Sanderson', notificationsEnabled: true });
    expect(mockApiClient).toHaveBeenCalledWith('/api/authors/follow', {
      method: 'POST',
      body: JSON.stringify({ authorName: 'Brandon Sanderson', notificationsEnabled: true }),
    });
    expect(result).toEqual(mockFollowed);
  });
});

describe('bookTrackerUnfollowAuthor', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('swallows ApiError with status 0 (204 No Content)', async () => {
    mockApiClient.mockRejectedValueOnce(new ApiError('empty body', 0));
    await expect(bookTrackerUnfollowAuthor('Brandon Sanderson')).resolves.toBeUndefined();
  });

  it('rethrows ApiError when status is not 0', async () => {
    const serverErr = new ApiError('server error', 500);
    mockApiClient.mockRejectedValueOnce(serverErr);
    await expect(bookTrackerUnfollowAuthor('Brandon Sanderson')).rejects.toThrow(serverErr);
  });
});

describe('bookTrackerGetFollowedAuthors', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('should GET followed authors', async () => {
    const mockAuthors: BookTrackerFollowedAuthor[] = [
      { id: 'fa-1', authorName: 'Author 1', followedAt: '', notificationsEnabled: true },
    ];
    mockApiClient.mockResolvedValueOnce(mockAuthors);

    const result = await bookTrackerGetFollowedAuthors();
    expect(mockApiClient).toHaveBeenCalledWith('/api/authors/following');
    expect(result).toEqual(mockAuthors);
  });
});

describe('bookTrackerAuthorsReadableError', () => {
  it('should return user-friendly message for 400', () => {
    expect(bookTrackerAuthorsReadableError(new ApiError('Bad request', 400))).toBe('Invalid request.');
  });

  it('should return generic message for unknown errors', () => {
    expect(bookTrackerAuthorsReadableError(new Error('unknown'))).toBe('Something went wrong. Please try again.');
  });
});
