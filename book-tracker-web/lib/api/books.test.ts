import {
  BOOK_TRACKER_BOOK_ROUTES,
  bookTrackerGetBooks,
  bookTrackerGetBook,
  bookTrackerAddBook,
  bookTrackerUpdateBook,
  bookTrackerUpdateBookStatus,
  bookTrackerDeleteBook,
  bookTrackerBookReadableError,
} from './books';
import { apiClient, ApiError } from '@/lib/api/client';
import type {
  BookTrackerBook,
  BookTrackerBookListResponse,
  BookTrackerAddBookPayload,
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

const SAMPLE_BOOK: BookTrackerBook = {
  id: 'b-001',
  title: 'The Great Gatsby',
  author: 'F. Scott Fitzgerald',
  isbn: '978-0743273565',
  coverImageUrl: null,
  description: 'A novel about the American dream.',
  genres: ['Fiction', 'Classic'],
  publicationDate: '1925-04-10',
  status: 'Completed',
  addedDate: '2024-01-15T00:00:00Z',
  source: 'Bookstore',
  rating: { id: 'r-001', score: 5, notes: 'Masterpiece', ratedDate: '2024-02-01T00:00:00Z', updatedDate: null },
};

describe('BOOK_TRACKER_BOOK_ROUTES', () => {
  it('exposes the expected route paths', () => {
    expect(BOOK_TRACKER_BOOK_ROUTES.list).toBe('/api/books');
    expect(BOOK_TRACKER_BOOK_ROUTES.detail('abc')).toBe('/api/books/abc');
    expect(BOOK_TRACKER_BOOK_ROUTES.updateStatus('abc')).toBe('/api/books/abc/status');
  });
});

describe('bookTrackerGetBooks', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls apiClient with query params for status, page, and pageSize', async () => {
    const response: BookTrackerBookListResponse = {
      items: [SAMPLE_BOOK],
      totalCount: 1,
      page: 1,
      pageSize: 20,
    };
    mockedApiClient.mockResolvedValueOnce(response);

    const result = await bookTrackerGetBooks('Completed', 1, 20);

    expect(mockedApiClient).toHaveBeenCalledWith(
      '/api/books?status=Completed&page=1&pageSize=20',
    );
    expect(result).toEqual(response);
  });

  it('omits status when not provided', async () => {
    const response: BookTrackerBookListResponse = {
      items: [],
      totalCount: 0,
      page: 1,
      pageSize: 20,
    };
    mockedApiClient.mockResolvedValueOnce(response);

    await bookTrackerGetBooks();

    expect(mockedApiClient).toHaveBeenCalledWith(
      '/api/books?page=1&pageSize=20',
    );
  });
});

describe('bookTrackerGetBook', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls apiClient with the detail route for the given ID', async () => {
    mockedApiClient.mockResolvedValueOnce(SAMPLE_BOOK);

    const result = await bookTrackerGetBook('b-001');

    expect(mockedApiClient).toHaveBeenCalledWith('/api/books/b-001');
    expect(result).toEqual(SAMPLE_BOOK);
  });
});

describe('bookTrackerAddBook', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls apiClient with POST method and stringified payload', async () => {
    const payload: BookTrackerAddBookPayload = {
      title: 'New Book',
      author: 'Author Name',
      status: 'ToRead',
    };
    mockedApiClient.mockResolvedValueOnce({ ...SAMPLE_BOOK, id: 'b-new', title: 'New Book' });

    await bookTrackerAddBook(payload);

    expect(mockedApiClient).toHaveBeenCalledWith('/api/books', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  });
});

describe('bookTrackerUpdateBook', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls apiClient with PUT method and stringified payload', async () => {
    mockedApiClient.mockResolvedValueOnce(SAMPLE_BOOK);

    await bookTrackerUpdateBook('b-001', { title: 'Updated Title' });

    expect(mockedApiClient).toHaveBeenCalledWith('/api/books/b-001', {
      method: 'PUT',
      body: JSON.stringify({ title: 'Updated Title' }),
    });
  });
});

describe('bookTrackerUpdateBookStatus', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls apiClient with PATCH method and status payload', async () => {
    mockedApiClient.mockResolvedValueOnce({ ...SAMPLE_BOOK, status: 'Reading' });

    await bookTrackerUpdateBookStatus('b-001', { status: 'Reading' });

    expect(mockedApiClient).toHaveBeenCalledWith('/api/books/b-001/status', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'Reading' }),
    });
  });
});

describe('bookTrackerDeleteBook', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls apiClient with DELETE method', async () => {
    mockedApiClient.mockResolvedValueOnce(undefined);

    await bookTrackerDeleteBook('b-001');

    expect(mockedApiClient).toHaveBeenCalledWith('/api/books/b-001', {
      method: 'DELETE',
    });
  });

  it('swallows ApiError with status 0 (JSON-parse on 204)', async () => {
    mockedApiClient.mockRejectedValueOnce(new ApiError('empty body', 0));

    await expect(bookTrackerDeleteBook('b-001')).resolves.toBeUndefined();
  });

  it('rethrows ApiError when the status is not 0', async () => {
    const serverErr = new ApiError('server error', 500);
    mockedApiClient.mockRejectedValueOnce(serverErr);

    await expect(bookTrackerDeleteBook('b-001')).rejects.toThrow(serverErr);
  });
});

describe('bookTrackerBookReadableError', () => {
  it('returns the envelope message when ApiError carries a body with message', () => {
    const err = new ApiError('HTTP 409', 409, {
      message: 'Duplicate book detected',
    });
    expect(bookTrackerBookReadableError(err)).toBe('Duplicate book detected');
  });

  it('returns 404 message for not-found errors', () => {
    const err = new ApiError('HTTP 404', 404);
    expect(bookTrackerBookReadableError(err)).toBe('Book not found.');
  });

  it('returns 409 message for conflict errors', () => {
    const err = new ApiError('HTTP 409', 409);
    expect(bookTrackerBookReadableError(err)).toBe(
      'A book with this ISBN already exists in your library.',
    );
  });

  it('returns 403 message for forbidden errors', () => {
    const err = new ApiError('HTTP 403', 403);
    expect(bookTrackerBookReadableError(err)).toBe(
      'You do not have permission to access this book.',
    );
  });

  it('falls back to generic message for unmapped status codes', () => {
    const err = new ApiError('HTTP 502', 502);
    expect(bookTrackerBookReadableError(err)).toBe(
      'Something unexpected happened. Please try again.',
    );
  });

  it('returns the message property for plain Error instances', () => {
    expect(bookTrackerBookReadableError(new Error('timeout'))).toBe('timeout');
  });

  it('returns the unknown-problem string for non-error values', () => {
    expect(bookTrackerBookReadableError(null)).toBe(
      'An unknown problem occurred while contacting BookTracker.',
    );
  });
});
