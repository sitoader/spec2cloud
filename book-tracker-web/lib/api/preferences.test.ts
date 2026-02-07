/**
 * Test suite for BookTracker preferences API client functions.
 */

import {
  bookTrackerGetPreferences,
  bookTrackerUpdatePreferences,
} from './preferences';
import { apiClient } from './client';
import type { BookTrackerUserPreferences } from '@/types';

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

describe('bookTrackerGetPreferences', () => {
  const mockPrefs: BookTrackerUserPreferences = {
    id: 'prefs-1',
    preferredGenres: ['Fiction', 'Science Fiction'],
    preferredThemes: ['time travel'],
    favoriteAuthors: ['Brandon Sanderson'],
    createdDate: '2024-01-01T00:00:00Z',
    updatedDate: '2024-06-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch preferences', async () => {
    mockApiClient.mockResolvedValueOnce(mockPrefs);

    const result = await bookTrackerGetPreferences();

    expect(mockApiClient).toHaveBeenCalledWith('/api/preferences');
    expect(result).toEqual(mockPrefs);
  });
});

describe('bookTrackerUpdatePreferences', () => {
  const mockPrefs: BookTrackerUserPreferences = {
    id: 'prefs-1',
    preferredGenres: ['Fantasy'],
    preferredThemes: ['magic'],
    favoriteAuthors: ['J.R.R. Tolkien'],
    createdDate: '2024-01-01T00:00:00Z',
    updatedDate: '2024-06-02T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update preferences', async () => {
    mockApiClient.mockResolvedValueOnce(mockPrefs);

    const payload = {
      preferredGenres: ['Fantasy'],
      preferredThemes: ['magic'],
      favoriteAuthors: ['J.R.R. Tolkien'],
    };

    const result = await bookTrackerUpdatePreferences(payload);

    expect(mockApiClient).toHaveBeenCalledWith('/api/preferences', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    expect(result).toEqual(mockPrefs);
  });

  it('should handle empty arrays', async () => {
    const emptyPrefs: BookTrackerUserPreferences = {
      id: 'prefs-1',
      createdDate: '2024-01-01T00:00:00Z',
    };
    mockApiClient.mockResolvedValueOnce(emptyPrefs);

    const payload = {
      preferredGenres: [],
      preferredThemes: [],
      favoriteAuthors: [],
    };

    const result = await bookTrackerUpdatePreferences(payload);

    expect(result).toEqual(emptyPrefs);
  });
});
