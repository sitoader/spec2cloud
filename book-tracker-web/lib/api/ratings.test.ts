/**
 * Test suite for BookTracker ratings API client functions.
 */

import {
  bookTrackerAddOrUpdateRating,
  bookTrackerDeleteRating,
} from './ratings';
import { apiClient, ApiError } from './client';
import type { BookTrackerRating } from '@/types';

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

describe('bookTrackerAddOrUpdateRating', () => {
  const mockRating: BookTrackerRating = {
    id: 'rating-1',
    score: 4,
    notes: 'Great book!',
    ratedDate: '2024-06-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add a rating with score and notes', async () => {
    mockApiClient.mockResolvedValueOnce(mockRating);

    const result = await bookTrackerAddOrUpdateRating('book-1', 4, 'Great book!');

    expect(mockApiClient).toHaveBeenCalledWith('/api/books/book-1/rating', {
      method: 'POST',
      body: JSON.stringify({ score: 4, notes: 'Great book!' }),
    });
    expect(result).toEqual(mockRating);
  });

  it('should add a rating with score only', async () => {
    const ratingNoNotes = { ...mockRating, notes: undefined };
    mockApiClient.mockResolvedValueOnce(ratingNoNotes);

    const result = await bookTrackerAddOrUpdateRating('book-1', 5);

    expect(mockApiClient).toHaveBeenCalledWith('/api/books/book-1/rating', {
      method: 'POST',
      body: JSON.stringify({ score: 5 }),
    });
    expect(result).toEqual(ratingNoNotes);
  });

  it('should propagate API errors', async () => {
    mockApiClient.mockRejectedValueOnce(new ApiError('Not found', 404));

    await expect(bookTrackerAddOrUpdateRating('bad-id', 3)).rejects.toThrow('Not found');
  });
});

describe('bookTrackerDeleteRating', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('swallows ApiError with status 0 (JSON parse on 204)', async () => {
    mockApiClient.mockRejectedValueOnce(new ApiError('empty body', 0));

    await expect(bookTrackerDeleteRating('book-1')).resolves.toBeUndefined();
  });

  it('rethrows ApiError when the status is not 0', async () => {
    const serverErr = new ApiError('server error', 500);
    mockApiClient.mockRejectedValueOnce(serverErr);

    await expect(bookTrackerDeleteRating('book-1')).rejects.toThrow(serverErr);
  });

  it('calls DELETE on the correct endpoint', async () => {
    mockApiClient.mockRejectedValueOnce(new ApiError('empty body', 0));

    await bookTrackerDeleteRating('book-42');

    expect(mockApiClient).toHaveBeenCalledWith('/api/books/book-42/rating', {
      method: 'DELETE',
    });
  });
});
