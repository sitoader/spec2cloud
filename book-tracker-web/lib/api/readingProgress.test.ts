/**
 * Test suite for BookTracker reading progress API client functions.
 */

import {
  bookTrackerLogSession,
  bookTrackerGetSessions,
  bookTrackerGetProgress,
  bookTrackerUpdateProgress,
  bookTrackerGetStreak,
  bookTrackerProgressReadableError,
} from './readingProgress';
import { apiClient, ApiError } from './client';
import type { BookTrackerReadingSession, BookTrackerReadingProgress, BookTrackerReadingStreak } from '@/types';

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

describe('bookTrackerLogSession', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('should POST a reading session', async () => {
    const mockSession: BookTrackerReadingSession = {
      id: 'session-1',
      bookId: 'book-1',
      startTime: '2026-02-08T10:00:00Z',
      endTime: '2026-02-08T11:30:00Z',
      pagesRead: 45,
      currentPage: 145,
      createdAt: '2026-02-08T11:30:00Z',
    };
    mockApiClient.mockResolvedValueOnce(mockSession);

    const result = await bookTrackerLogSession({
      bookId: 'book-1',
      startTime: '2026-02-08T10:00:00Z',
      endTime: '2026-02-08T11:30:00Z',
      pagesRead: 45,
      currentPage: 145,
    });

    expect(mockApiClient).toHaveBeenCalledWith('/api/reading-sessions', {
      method: 'POST',
      body: expect.any(String),
    });
    expect(result).toEqual(mockSession);
  });
});

describe('bookTrackerGetSessions', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('should GET sessions without filters', async () => {
    mockApiClient.mockResolvedValueOnce([]);
    await bookTrackerGetSessions();
    expect(mockApiClient).toHaveBeenCalledWith('/api/reading-sessions');
  });

  it('should GET sessions with bookId filter', async () => {
    mockApiClient.mockResolvedValueOnce([]);
    await bookTrackerGetSessions('book-1');
    expect(mockApiClient).toHaveBeenCalledWith('/api/reading-sessions?bookId=book-1');
  });
});

describe('bookTrackerGetProgress', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('should GET progress for a book', async () => {
    const mockProgress: BookTrackerReadingProgress = {
      id: 'progress-1',
      bookId: 'book-1',
      totalPages: 350,
      currentPage: 145,
      progressPercentage: 41.43,
      lastUpdated: '2026-02-08T00:00:00Z',
    };
    mockApiClient.mockResolvedValueOnce(mockProgress);

    const result = await bookTrackerGetProgress('book-1');
    expect(result).toEqual(mockProgress);
  });
});

describe('bookTrackerUpdateProgress', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('should PUT progress update', async () => {
    const mockProgress: BookTrackerReadingProgress = {
      id: 'progress-1',
      bookId: 'book-1',
      totalPages: 350,
      currentPage: 200,
      progressPercentage: 57.14,
      lastUpdated: '2026-02-08T00:00:00Z',
    };
    mockApiClient.mockResolvedValueOnce(mockProgress);

    const result = await bookTrackerUpdateProgress('book-1', { currentPage: 200, totalPages: 350 });
    expect(mockApiClient).toHaveBeenCalledWith('/api/reading-progress/book-1', {
      method: 'PUT',
      body: JSON.stringify({ currentPage: 200, totalPages: 350 }),
    });
    expect(result).toEqual(mockProgress);
  });
});

describe('bookTrackerGetStreak', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('should GET the reading streak', async () => {
    const mockStreak: BookTrackerReadingStreak = {
      currentStreak: 7,
      longestStreak: 14,
      lastReadDate: '2026-02-08',
    };
    mockApiClient.mockResolvedValueOnce(mockStreak);

    const result = await bookTrackerGetStreak();
    expect(result).toEqual(mockStreak);
  });
});

describe('bookTrackerProgressReadableError', () => {
  it('should return user-friendly message for 404', () => {
    const error = new ApiError('Not found', 404);
    expect(bookTrackerProgressReadableError(error)).toBe('Not found.');
  });

  it('should return generic message for unknown errors', () => {
    expect(bookTrackerProgressReadableError(new Error('unknown'))).toBe('Something went wrong. Please try again.');
  });
});
