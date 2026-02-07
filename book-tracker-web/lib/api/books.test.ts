/**
 * Test suite for BookTracker books API client functions.
 */

import {
  bookTrackerGetBooks,
  bookTrackerGetBook,
  bookTrackerAddBook,
  bookTrackerUpdateBook,
  bookTrackerUpdateBookStatus,
  bookTrackerDeleteBook,
} from './books';
import { apiClient, ApiError } from './client';
import { BookTrackerBookStatus } from '@/types';
import type { BookTrackerBook, BookTrackerBooksResponse } from '@/types';

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

describe('bookTrackerGetBooks', () => {
  const mockResponse: BookTrackerBooksResponse = {
    items: [
      {
        id: 'book-1',
        title: 'Test Book',
        author: 'Test Author',
        status: BookTrackerBookStatus.ToRead,
        addedDate: '2024-01-01T00:00:00Z',
      } as BookTrackerBook,
    ],
    totalCount: 1,
    page: 1,
    pageSize: 20,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch books without filters', async () => {
    mockApiClient.mockResolvedValueOnce(mockResponse);

    const result = await bookTrackerGetBooks();

    expect(mockApiClient).toHaveBeenCalledWith('/api/books?page=1&pageSize=20');
    expect(result).toEqual(mockResponse);
  });

  it('should fetch books with status filter', async () => {
    mockApiClient.mockResolvedValueOnce(mockResponse);

    const result = await bookTrackerGetBooks(BookTrackerBookStatus.Reading);

    expect(mockApiClient).toHaveBeenCalledWith('/api/books?status=1&page=1&pageSize=20');
    expect(result).toEqual(mockResponse);
  });

  it('should fetch books with custom pagination', async () => {
    mockApiClient.mockResolvedValueOnce(mockResponse);

    const result = await bookTrackerGetBooks(undefined, 2, 50);

    expect(mockApiClient).toHaveBeenCalledWith('/api/books?page=2&pageSize=50');
    expect(result).toEqual(mockResponse);
  });
});

describe('bookTrackerGetBook', () => {
  const mockBook: BookTrackerBook = {
    id: 'book-123',
    title: 'Sample Book',
    author: 'Sample Author',
    status: BookTrackerBookStatus.Completed,
    addedDate: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch a single book by ID', async () => {
    mockApiClient.mockResolvedValueOnce(mockBook);

    const result = await bookTrackerGetBook('book-123');

    expect(mockApiClient).toHaveBeenCalledWith('/api/books/book-123');
    expect(result).toEqual(mockBook);
  });
});

describe('bookTrackerAddBook', () => {
  const mockBook: BookTrackerBook = {
    id: 'new-book',
    title: 'New Book',
    author: 'New Author',
    status: BookTrackerBookStatus.ToRead,
    addedDate: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add a new book', async () => {
    mockApiClient.mockResolvedValueOnce(mockBook);

    const payload = {
      title: 'New Book',
      author: 'New Author',
      status: BookTrackerBookStatus.ToRead,
    };

    const result = await bookTrackerAddBook(payload);

    expect(mockApiClient).toHaveBeenCalledWith('/api/books', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    expect(result).toEqual(mockBook);
  });
});

describe('bookTrackerUpdateBook', () => {
  const mockBook: BookTrackerBook = {
    id: 'book-123',
    title: 'Updated Book',
    author: 'Updated Author',
    status: BookTrackerBookStatus.Reading,
    addedDate: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update a book', async () => {
    mockApiClient.mockResolvedValueOnce(mockBook);

    const payload = {
      title: 'Updated Book',
      status: BookTrackerBookStatus.Reading,
    };

    const result = await bookTrackerUpdateBook('book-123', payload);

    expect(mockApiClient).toHaveBeenCalledWith('/api/books/book-123', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    expect(result).toEqual(mockBook);
  });
});

describe('bookTrackerUpdateBookStatus', () => {
  const mockBook: BookTrackerBook = {
    id: 'book-123',
    title: 'Test Book',
    author: 'Test Author',
    status: BookTrackerBookStatus.Completed,
    addedDate: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update book status', async () => {
    mockApiClient.mockResolvedValueOnce(mockBook);

    const result = await bookTrackerUpdateBookStatus('book-123', BookTrackerBookStatus.Completed);

    expect(mockApiClient).toHaveBeenCalledWith('/api/books/book-123/status', {
      method: 'PATCH',
      body: JSON.stringify({ status: BookTrackerBookStatus.Completed }),
    });
    expect(result).toEqual(mockBook);
  });
});

describe('bookTrackerDeleteBook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('swallows ApiError with status 0 (JSON parse on 204)', async () => {
    mockApiClient.mockRejectedValueOnce(new ApiError('empty body', 0));

    await expect(bookTrackerDeleteBook('book-123')).resolves.toBeUndefined();
  });

  it('rethrows ApiError when the status is not 0', async () => {
    const serverErr = new ApiError('server error', 500);
    mockApiClient.mockRejectedValueOnce(serverErr);

    await expect(bookTrackerDeleteBook('book-456')).rejects.toThrow(serverErr);
  });
});
