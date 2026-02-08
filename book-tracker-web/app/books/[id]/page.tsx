'use client';

/**
 * BookTracker publication detail orchestrator page.
 *
 * Fetches and displays comprehensive book information for
 * a specific library entry identified by URL parameter.
 * Includes integrated rating form for adding/editing ratings.
 */

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import type { BookTrackerBook } from '@/types';
import { bookTrackerGetBook } from '@/lib/api/books';
import { BookTrackerBookDetail } from '@/components/books/BookDetail';
import BookTrackerRatingForm from '@/components/ratings/BookTrackerRatingForm';
import BookTrackerNotesDisplay from '@/components/ratings/BookTrackerNotesDisplay';
import BookTrackerRatingStars from '@/components/ratings/BookTrackerRatingStars';
import { bookTrackerAddOrUpdateRating, bookTrackerDeleteRating } from '@/lib/api/ratings';
import { BookTrackerHeader } from '@/components/layout/Header';

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function BookTrackerBookDetailPage(): React.JSX.Element {
  const params = useParams();
  const publicationId = params.id as string;

  const [publication, setPublication] = useState<BookTrackerBook | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string>('');
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingSaving, setRatingSaving] = useState(false);
  const [ratingError, setRatingError] = useState('');

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
    void loadPublication();
  }, [loadPublication]);

  const handleRatingSave = useCallback(
    async (score: number, notes?: string): Promise<void> => {
      if (!publication) return;
      setRatingSaving(true);
      setRatingError('');
      try {
        const updatedRating = await bookTrackerAddOrUpdateRating(publication.id, score, notes);
        setPublication((prev) =>
          prev ? { ...prev, rating: updatedRating } : prev,
        );
        setShowRatingForm(false);
      } catch (err) {
        setRatingError(err instanceof Error ? err.message : 'Failed to save rating');
      } finally {
        setRatingSaving(false);
      }
    },
    [publication],
  );

  const handleRatingDelete = useCallback(async (): Promise<void> => {
    if (!publication) return;
    setRatingSaving(true);
    setRatingError('');
    try {
      await bookTrackerDeleteRating(publication.id);
      setPublication((prev) =>
        prev ? { ...prev, rating: undefined } : prev,
      );
      setShowRatingForm(false);
    } catch (err) {
      setRatingError(err instanceof Error ? err.message : 'Failed to delete rating');
    } finally {
      setRatingSaving(false);
    }
  }, [publication]);

  return (
    <>
      <BookTrackerHeader />
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
        <>
          <BookTrackerBookDetail publication={publication} />

          {/* Rating section */}
          <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Your Rating
            </h2>

            {ratingError && (
              <div
                role="alert"
                className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
              >
                {ratingError}
              </div>
            )}

            {/* Display existing rating or prompt to rate */}
            {publication.rating && !showRatingForm ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <BookTrackerRatingStars value={publication.rating.score} readOnly />
                  <button
                    type="button"
                    onClick={(): void => setShowRatingForm(true)}
                    className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={(): void => { void handleRatingDelete(); }}
                    disabled={ratingSaving}
                    className="text-xs font-medium text-red-500 transition-colors hover:text-red-700 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
                {publication.rating.notes && (
                  <BookTrackerNotesDisplay
                    notes={publication.rating.notes}
                    onEdit={(): void => setShowRatingForm(true)}
                  />
                )}
              </div>
            ) : showRatingForm ? (
              <BookTrackerRatingForm
                initialScore={publication.rating?.score ?? 0}
                initialNotes={publication.rating?.notes ?? ''}
                onSave={handleRatingSave}
                onCancel={(): void => setShowRatingForm(false)}
                saving={ratingSaving}
              />
            ) : (
              <button
                type="button"
                onClick={(): void => setShowRatingForm(true)}
                className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                ★ Rate this book
              </button>
            )}
          </div>
        </>
      )}
      </div>
    </>
  );
}
