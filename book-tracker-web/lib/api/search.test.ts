/**
 * Unit tests for the BookTracker external-catalogue search client.
 */

import { bookTrackerSearchBooks, bookTrackerSearchReadableError } from './search';
import { apiClient, ApiError } from './client';
import type { BookTrackerExternalBook } from '@/types';

jest.mock('./client', () => {
  const RealApiError = jest.requireActual<typeof import('./client')>('./client').ApiError;
  return { apiClient: jest.fn(), ApiError: RealApiError };
});

const mockedClient = apiClient as jest.MockedFunction<typeof apiClient>;

/* ------------------------------------------------------------------ */
/*  bookTrackerSearchBooks                                             */
/* ------------------------------------------------------------------ */

describe('bookTrackerSearchBooks', () => {
  const sampleHit: BookTrackerExternalBook = {
    externalId: 'gbooks-abc',
    title: 'Neuromancer',
    author: 'William Gibson',
    isbn: '978-0-441-56956-4',
    coverImageUrl: 'https://covers.example.org/neuro.jpg',
    description: 'A hacker navigates cyberspace.',
    genres: ['Science Fiction', 'Cyberpunk'],
    publicationYear: 1984,
    source: 'google-books',
  };

  beforeEach(() => jest.clearAllMocks());

  it('forwards the phrase and default cap to the API', async () => {
    mockedClient.mockResolvedValueOnce([sampleHit]);

    const hits = await bookTrackerSearchBooks('neuromancer');

    expect(mockedClient).toHaveBeenCalledWith(
      '/api/search/books?query=neuromancer&maxResults=20',
    );
    expect(hits).toHaveLength(1);
    expect(hits[0].title).toBe('Neuromancer');
  });

  it('passes a custom result cap when provided', async () => {
    mockedClient.mockResolvedValueOnce([sampleHit]);

    await bookTrackerSearchBooks('cyberpunk', 5);

    expect(mockedClient).toHaveBeenCalledWith(
      '/api/search/books?query=cyberpunk&maxResults=5',
    );
  });

  it('resolves to an empty array when the API returns nothing', async () => {
    mockedClient.mockResolvedValueOnce([]);

    const hits = await bookTrackerSearchBooks('zzz_no_match');

    expect(hits).toEqual([]);
  });

  it('propagates API errors to the caller', async () => {
    mockedClient.mockRejectedValueOnce(new ApiError('Bad Request', 400));

    await expect(bookTrackerSearchBooks('ab')).rejects.toThrow('Bad Request');
  });
});

/* ------------------------------------------------------------------ */
/*  bookTrackerSearchReadableError                                     */
/* ------------------------------------------------------------------ */

describe('bookTrackerSearchReadableError', () => {
  it('extracts the message from an API error envelope', () => {
    const err = new ApiError('err', 400, { message: 'Query too short' });
    expect(bookTrackerSearchReadableError(err)).toBe('Query too short');
  });

  it('falls back to a status-mapped message when no envelope', () => {
    expect(bookTrackerSearchReadableError(new ApiError('x', 401))).toBe(
      'Please sign in to search for books.',
    );
  });

  it('uses a generic fallback for unknown status codes', () => {
    const msg = bookTrackerSearchReadableError(new ApiError('x', 500));
    expect(msg).toContain('Something went wrong');
  });

  it('returns the message of plain Error instances', () => {
    expect(bookTrackerSearchReadableError(new TypeError('fail'))).toBe('fail');
  });

  it('returns a safe string for non-Error values', () => {
    expect(bookTrackerSearchReadableError(42)).toBe('An unexpected error occurred.');
  });
});
