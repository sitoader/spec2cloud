/**
 * Test suite for BookTracker collections API client functions.
 */

import {
  bookTrackerGetCollections,
  bookTrackerCreateCollection,
  bookTrackerDeleteCollection,
  bookTrackerAddBookToCollection,
  bookTrackerCollectionsReadableError,
} from './collections';
import { apiClient, ApiError } from './client';
import type { BookTrackerCollection, BookTrackerCollectionBook } from '@/types';

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

describe('bookTrackerGetCollections', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('should GET user collections', async () => {
    const mockCollections: BookTrackerCollection[] = [
      { id: 'col-1', name: 'Summer', isPublic: true, bookCount: 5, createdAt: '', updatedAt: '' },
    ];
    mockApiClient.mockResolvedValueOnce(mockCollections);

    const result = await bookTrackerGetCollections();
    expect(mockApiClient).toHaveBeenCalledWith('/api/collections');
    expect(result).toEqual(mockCollections);
  });
});

describe('bookTrackerCreateCollection', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('should POST a new collection', async () => {
    const mockCollection: BookTrackerCollection = {
      id: 'col-new', name: 'My List', description: 'Desc', isPublic: false, bookCount: 0, createdAt: '', updatedAt: '',
    };
    mockApiClient.mockResolvedValueOnce(mockCollection);

    const result = await bookTrackerCreateCollection({ name: 'My List', description: 'Desc', isPublic: false });
    expect(mockApiClient).toHaveBeenCalledWith('/api/collections', {
      method: 'POST',
      body: JSON.stringify({ name: 'My List', description: 'Desc', isPublic: false }),
    });
    expect(result).toEqual(mockCollection);
  });
});

describe('bookTrackerDeleteCollection', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('swallows ApiError with status 0 (204 No Content)', async () => {
    mockApiClient.mockRejectedValueOnce(new ApiError('empty body', 0));
    await expect(bookTrackerDeleteCollection('col-1')).resolves.toBeUndefined();
  });

  it('rethrows ApiError when status is not 0', async () => {
    const serverErr = new ApiError('server error', 500);
    mockApiClient.mockRejectedValueOnce(serverErr);
    await expect(bookTrackerDeleteCollection('col-1')).rejects.toThrow(serverErr);
  });
});

describe('bookTrackerAddBookToCollection', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('should POST a book to a collection', async () => {
    const mockEntry: BookTrackerCollectionBook = {
      id: 'entry-1', bookId: 'book-1', addedAt: '', notes: 'Note',
    };
    mockApiClient.mockResolvedValueOnce(mockEntry);

    const result = await bookTrackerAddBookToCollection('col-1', { bookId: 'book-1', notes: 'Note' });
    expect(mockApiClient).toHaveBeenCalledWith('/api/collections/col-1/books', {
      method: 'POST',
      body: JSON.stringify({ bookId: 'book-1', notes: 'Note' }),
    });
    expect(result).toEqual(mockEntry);
  });
});

describe('bookTrackerCollectionsReadableError', () => {
  it('should return user-friendly message for 404', () => {
    expect(bookTrackerCollectionsReadableError(new ApiError('Not found', 404))).toBe('Collection not found.');
  });

  it('should return user-friendly message for 403', () => {
    expect(bookTrackerCollectionsReadableError(new ApiError('Forbidden', 403))).toBe('Access denied.');
  });

  it('should return generic message for unknown errors', () => {
    expect(bookTrackerCollectionsReadableError(new Error('unknown'))).toBe('Something went wrong. Please try again.');
  });
});
