/**
 * Test suite for BookTracker recommendations API client functions.
 */

import {
  bookTrackerGenerateRecommendations,
  bookTrackerRecommendationsReadableError,
  bookTrackerIsRateLimited,
} from './recommendations';
import { apiClient, ApiError } from './client';
import type { BookTrackerRecommendationsResponse } from '@/types';

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

describe('bookTrackerGenerateRecommendations', () => {
  const mockResponse: BookTrackerRecommendationsResponse = {
    recommendations: [
      {
        title: 'Test Book',
        author: 'Test Author',
        genre: 'Fiction',
        reason: 'You enjoyed similar books',
        confidenceScore: 4,
      },
    ],
    generatedAt: '2024-01-01T00:00:00Z',
    booksAnalyzed: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call POST /api/recommendations/generate with default count', async () => {
    mockApiClient.mockResolvedValueOnce(mockResponse);

    const result = await bookTrackerGenerateRecommendations();

    expect(mockApiClient).toHaveBeenCalledWith('/api/recommendations/generate', {
      method: 'POST',
      body: JSON.stringify({ count: 5 }),
    });
    expect(result).toEqual(mockResponse);
  });

  it('should call with custom count', async () => {
    mockApiClient.mockResolvedValueOnce(mockResponse);

    const result = await bookTrackerGenerateRecommendations(3);

    expect(mockApiClient).toHaveBeenCalledWith('/api/recommendations/generate', {
      method: 'POST',
      body: JSON.stringify({ count: 3 }),
    });
    expect(result).toEqual(mockResponse);
  });

  it('should propagate errors from apiClient', async () => {
    const error = new ApiError('Bad Request', 400);
    mockApiClient.mockRejectedValueOnce(error);

    await expect(bookTrackerGenerateRecommendations()).rejects.toThrow(error);
  });
});

describe('bookTrackerRecommendationsReadableError', () => {
  it('returns envelope message when present', () => {
    const error = new ApiError('HTTP 400', 400, {
      message: 'You need at least 3 rated books.',
    });
    expect(bookTrackerRecommendationsReadableError(error)).toBe(
      'You need at least 3 rated books.',
    );
  });

  it('returns friendly message for known status codes', () => {
    const error = new ApiError('HTTP 429', 429);
    expect(bookTrackerRecommendationsReadableError(error)).toBe(
      "You've reached today's limit (10). Try again tomorrow.",
    );
  });

  it('returns fallback for unknown ApiError status', () => {
    const error = new ApiError('HTTP 500', 500);
    expect(bookTrackerRecommendationsReadableError(error)).toBe(
      'Something went wrong while generating recommendations. Please try again.',
    );
  });

  it('returns Error.message for generic errors', () => {
    const error = new Error('Network failure');
    expect(bookTrackerRecommendationsReadableError(error)).toBe('Network failure');
  });

  it('returns generic message for non-Error values', () => {
    expect(bookTrackerRecommendationsReadableError('oops')).toBe(
      'An unexpected error occurred.',
    );
  });
});

describe('bookTrackerIsRateLimited', () => {
  it('returns true for 429 ApiError', () => {
    expect(bookTrackerIsRateLimited(new ApiError('rate', 429))).toBe(true);
  });

  it('returns false for other ApiError statuses', () => {
    expect(bookTrackerIsRateLimited(new ApiError('bad', 400))).toBe(false);
  });

  it('returns false for non-ApiError values', () => {
    expect(bookTrackerIsRateLimited(new Error('fail'))).toBe(false);
    expect(bookTrackerIsRateLimited('string')).toBe(false);
  });
});
