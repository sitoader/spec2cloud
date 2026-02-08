'use client';

/**
 * BookTracker publication detail orchestrator page.
 *
 * Fetches and displays comprehensive book information for
 * a specific library entry identified by URL parameter.
 * Includes integrated rating, progress tracking, reviews,
 * collections, series info, and author following.
 */

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import type {
  BookTrackerBook,
  BookTrackerReadingProgress,
  BookTrackerReadingSession,
  BookTrackerBookReview,
  BookTrackerBookSeries,
} from '@/types';
import { BookTrackerBookStatus } from '@/types';
import { bookTrackerGetBook } from '@/lib/api/books';
import { BookTrackerBookDetail } from '@/components/books/BookDetail';

import { BookTrackerHeader } from '@/components/layout/Header';
import { useBookTrackerIdentity } from '@/lib/contexts/AuthContext';

/* New feature imports */
import { ReadingProgressBar } from '@/components/progress/ReadingProgressBar';
import { ReadingSessionForm } from '@/components/progress/ReadingSessionForm';
import { bookTrackerGetProgress, bookTrackerListSessions } from '@/lib/api/progress';
import { ReviewEditor } from '@/components/reviews/ReviewEditor';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { bookTrackerGetBookReviews, bookTrackerDeleteReview } from '@/lib/api/reviews';
import { AddToCollectionDialog } from '@/components/collections/AddToCollectionDialog';
import { SeriesBadge } from '@/components/series/SeriesBadge';
import { bookTrackerGetSeriesByBook } from '@/lib/api/series';
import { toast } from 'sonner';

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function BookTrackerBookDetailPage(): React.JSX.Element {
  const params = useParams();
  const publicationId = params.id as string;
  const { activeAccount } = useBookTrackerIdentity();

  /* Core state */
  const [publication, setPublication] = useState<BookTrackerBook | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string>('');



  /* Progress state */
  const [progress, setProgress] = useState<BookTrackerReadingProgress | null>(null);
  const [sessions, setSessions] = useState<BookTrackerReadingSession[]>([]);
  const [showSessionForm, setShowSessionForm] = useState(false);

  /* Reviews state */
  const [reviews, setReviews] = useState<BookTrackerBookReview[]>([]);
  const [showReviewEditor, setShowReviewEditor] = useState(false);
  const [editingReview, setEditingReview] = useState<BookTrackerBookReview | undefined>(undefined);

  /* Series state */
  const [series, setSeries] = useState<BookTrackerBookSeries | null>(null);

  /* Collection dialog */
  const [showCollectionDialog, setShowCollectionDialog] = useState(false);

  /* ---- Data loading ---- */

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

  const loadProgress = useCallback(async () => {
    if (!publicationId) return;
    try {
      const [prog, sess] = await Promise.all([
        bookTrackerGetProgress(publicationId),
        bookTrackerListSessions(publicationId),
      ]);
      setProgress(prog);
      setSessions(sess);
    } catch {
      /* Progress may not exist yet — that's fine */
    }
  }, [publicationId]);

  const loadReviews = useCallback(async () => {
    if (!publicationId) return;
    try {
      const data = await bookTrackerGetBookReviews(publicationId);
      setReviews(data);
    } catch {
      /* Reviews endpoint may 404 if none */
    }
  }, [publicationId]);

  const loadSeries = useCallback(async () => {
    if (!publicationId) return;
    try {
      const data = await bookTrackerGetSeriesByBook(publicationId);
      setSeries(data);
    } catch {
      /* Book may not belong to a series */
    }
  }, [publicationId]);

  useEffect(() => {
    void loadPublication();
    void loadProgress();
    void loadReviews();
    void loadSeries();
  }, [loadPublication, loadProgress, loadReviews, loadSeries]);



  /* ---- Review handlers ---- */

  const handleReviewDelete = useCallback(async (reviewId: string) => {
    try {
      await bookTrackerDeleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      toast.success('Review deleted');
    } catch {
      toast.error('Failed to delete review');
    }
  }, []);

  /* ---- Find current user's existing review ---- */
  const myReview = reviews.find((r) => r.userId === activeAccount?.userId);

  /* ---- Determine reading status ---- */
  const isReading = publication?.status === BookTrackerBookStatus.Reading;
  const isCompleted = publication?.status === BookTrackerBookStatus.Completed;

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
          <div className="space-y-8">
            {/* Series badge (inline above book detail) */}
            {series && (() => {
              const entry = series.entries?.find((e) => e.bookId === publicationId);
              return (
                <SeriesBadge
                  seriesName={series.name}
                  position={entry?.positionInSeries ?? 1}
                  totalBooks={series.totalBooks}
                />
              );
            })()}

            <BookTrackerBookDetail
              publication={publication}
              onAddToCollection={() => setShowCollectionDialog(true)}
              onWriteReview={() => {
                setEditingReview(undefined);
                setShowReviewEditor(true);
              }}
              hasReview={!!myReview}
            />

            {/* Reading progress (shown when status is Reading or Completed) */}
            {(isReading || isCompleted) && (
              <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    📖 Reading Progress
                  </h2>
                  {isReading && !showSessionForm && (
                    <button
                      type="button"
                      onClick={() => setShowSessionForm(true)}
                      className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                    >
                      + Log a reading session
                    </button>
                  )}
                </div>
                <ReadingProgressBar
                  bookId={publicationId}
                  progress={progress}
                  onUpdate={() => void loadProgress()}
                />

                {/* Inline session form */}
                {showSessionForm && (
                  <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-700">
                    <ReadingSessionForm
                      bookId={publicationId}
                      onSessionLogged={() => {
                        setShowSessionForm(false);
                        void loadProgress();
                      }}
                      onCancel={() => setShowSessionForm(false)}
                    />
                  </div>
                )}

                {/* Recent sessions */}
                {sessions.length > 0 && (
                  <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-700">
                    <h3 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Recent Sessions
                    </h3>
                    <div className="space-y-2">
                      {sessions.slice(0, 5).map((session) => {
                        const duration = session.endTime
                          ? Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000)
                          : null;
                        return (
                        <div
                          key={session.id}
                          className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400"
                        >
                          <div className="flex items-center gap-2">
                            {duration !== null && (
                              <span className="font-medium">
                                {duration}min
                              </span>
                            )}
                            {(session.pagesRead ?? 0) > 0 && (
                              <span>· {session.pagesRead} pages</span>
                            )}
                          </div>
                          <span>
                            {new Date(session.startTime).toLocaleDateString()}
                          </span>
                        </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Your Review summary card (when user has a review and editor is closed) */}
            {myReview && !showReviewEditor && (
              <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                  ✍️ Your Review
                </h2>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <svg
                        key={i}
                        className={`h-4 w-4 ${i < myReview.rating ? 'text-amber-400' : 'text-zinc-300 dark:text-zinc-600'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {myReview.rating}/5
                  </span>
                  {myReview.wouldRecommend && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      👍 Recommended
                    </span>
                  )}
                </div>
                {myReview.reviewText && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">
                    {myReview.reviewText}
                  </p>
                )}

                {/* Mood */}
                {myReview.mood && (
                  <div className="mt-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                      <span className="text-[10px] text-purple-400 dark:text-purple-500">Mood</span>
                      <span className="capitalize">{myReview.mood}</span>
                    </span>
                  </div>
                )}

                {/* Tags + Edit/Delete on the same line */}
                <div className={`${myReview.mood ? 'mt-2' : 'mt-3'} flex items-center justify-between`}>
                  <div className="flex flex-wrap items-center gap-2">
                    {myReview.tags && myReview.tags.length > 0 && (
                      <>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Tags</span>
                        {myReview.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingReview(myReview);
                        setShowReviewEditor(true);
                      }}
                      className="hover:text-zinc-600 dark:hover:text-zinc-300"
                    >
                      Edit
                    </button>
                    <span className="text-zinc-300 dark:text-zinc-600">·</span>
                    <button
                      type="button"
                      onClick={() => void handleReviewDelete(myReview.id)}
                      className="hover:text-red-500 dark:hover:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  💬 Reviews {reviews.length > 0 && `(${reviews.length})`}
                </h2>
                {!showReviewEditor && !myReview && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingReview(undefined);
                      setShowReviewEditor(true);
                    }}
                    className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                  >
                    + Write a review
                  </button>
                )}
              </div>

              {/* Write / edit review */}
              {showReviewEditor && (
                <ReviewEditor
                  bookId={publicationId}
                  existingReview={editingReview}
                  onSaved={() => {
                    setShowReviewEditor(false);
                    setEditingReview(undefined);
                    void loadReviews();
                  }}
                  onCancel={() => {
                    setShowReviewEditor(false);
                    setEditingReview(undefined);
                  }}
                />
              )}

              {reviews.length === 0 && !showReviewEditor && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  No reviews yet. Be the first to share your thoughts!
                </p>
              )}
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                />
              ))}
            </div>

            {/* Add to collection dialog */}
            <AddToCollectionDialog
              bookId={publicationId}
              open={showCollectionDialog}
              onClose={() => setShowCollectionDialog(false)}
            />
          </div>
        )}
      </div>
    </>
  );
}
