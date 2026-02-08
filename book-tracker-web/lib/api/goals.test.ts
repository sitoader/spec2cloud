/**
 * Test suite for BookTracker goals API client functions.
 */

import {
  bookTrackerSetGoal,
  bookTrackerGetGoal,
  bookTrackerGetAchievements,
  bookTrackerGetUserAchievements,
  bookTrackerGoalsReadableError,
} from './goals';
import { apiClient, ApiError } from './client';
import type { BookTrackerReadingGoal, BookTrackerAchievement } from '@/types';

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

describe('bookTrackerSetGoal', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('should POST a reading goal', async () => {
    const mockGoal: BookTrackerReadingGoal = {
      id: 'goal-1', year: 2026, targetBooksCount: 24, completedBooksCount: 0, createdAt: '', updatedAt: '',
    };
    mockApiClient.mockResolvedValueOnce(mockGoal);

    const result = await bookTrackerSetGoal({ year: 2026, targetBooksCount: 24 });
    expect(mockApiClient).toHaveBeenCalledWith('/api/reading-goals', {
      method: 'POST',
      body: JSON.stringify({ year: 2026, targetBooksCount: 24 }),
    });
    expect(result).toEqual(mockGoal);
  });
});

describe('bookTrackerGetGoal', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('should GET a goal by year', async () => {
    const mockGoal: BookTrackerReadingGoal = {
      id: 'goal-1', year: 2026, targetBooksCount: 24, completedBooksCount: 5, createdAt: '', updatedAt: '',
    };
    mockApiClient.mockResolvedValueOnce(mockGoal);

    const result = await bookTrackerGetGoal(2026);
    expect(mockApiClient).toHaveBeenCalledWith('/api/reading-goals/2026');
    expect(result).toEqual(mockGoal);
  });
});

describe('bookTrackerGetAchievements', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('should GET all achievements', async () => {
    const mockAchievements: BookTrackerAchievement[] = [
      { id: 'a-1', code: 'first_book', name: 'First Book' },
    ];
    mockApiClient.mockResolvedValueOnce(mockAchievements);

    const result = await bookTrackerGetAchievements();
    expect(mockApiClient).toHaveBeenCalledWith('/api/achievements');
    expect(result).toEqual(mockAchievements);
  });
});

describe('bookTrackerGetUserAchievements', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('should GET user achievements', async () => {
    mockApiClient.mockResolvedValueOnce([]);

    const result = await bookTrackerGetUserAchievements();
    expect(mockApiClient).toHaveBeenCalledWith('/api/achievements/user');
    expect(result).toEqual([]);
  });
});

describe('bookTrackerGoalsReadableError', () => {
  it('should return user-friendly message for 404', () => {
    expect(bookTrackerGoalsReadableError(new ApiError('Not found', 404))).toBe('Goal not found.');
  });

  it('should return generic message for unknown errors', () => {
    expect(bookTrackerGoalsReadableError(new Error('unknown'))).toBe('Something went wrong. Please try again.');
  });
});
