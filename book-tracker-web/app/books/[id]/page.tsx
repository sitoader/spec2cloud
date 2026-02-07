'use client';

/**
 * BookTracker publication detail orchestrator page.
 *
 * Fetches and displays comprehensive book information for
 * a specific library entry identified by URL parameter.
 */

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import type { BookTrackerBook } from '@/types';
import { bookTrackerGetBook } from '@/lib/api/books';
import { BookTrackerBookDetail } from '@/components/books/BookDetail';

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function BookTrackerBookDetailPage(): React.JSX.Element {
  const params = useParams();
  const publicationId = params.id as string;

  const [publication, setPublication] = useState<BookTrackerBook | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string>('');

  const loadPublication = useCallback(async () => {
    if (!publicationId) return;

    setIsFetching(true);
    setFetchError('');

    try {
      const data = await bookTrackerGetBook(publicationId);
      setPublication(data);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Failed to load book details');
    } finally {
      setIsFetching(false);
    }
  }, [publicationId]);

  useEffect(() => {
    loadPublication();
  }, [loadPublication]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Loading state */}
      {isFetching && (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-800 dark:border-t-zinc-200"></div>
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              Loading book details...
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {!isFetching && fetchError && (
        <div
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
        >
          {fetchError}
        </div>
      )}

      {/* Book detail view */}
      {!isFetching && !fetchError && publication && (
        <BookTrackerBookDetail publication={publication} />
      )}
    </div>
  );
}
