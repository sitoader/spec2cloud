'use client';

/**
 * BookTrackerBookDetail — comprehensive publication viewer.
 *
 * Renders complete book metadata with status management controls,
 * deletion capabilities, and structured information display.
 */

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BookTrackerBook } from '@/types';
import { BookTrackerBookStatus } from '@/types';
import { BookTrackerStatusBadge } from './StatusBadge';
import { BookTrackerConfirmDialog } from './ConfirmDialog';
import {
  bookTrackerUpdateBookStatus,
  bookTrackerDeleteBook,
} from '@/lib/api/books';
import { FollowAuthorButton } from '@/components/authors/FollowAuthorButton';

/* ------------------------------------------------------------------ */
/*  Interface declarations                                             */
/* ------------------------------------------------------------------ */

interface BookTrackerBookDetailProps {
  publication: BookTrackerBook;
  onAddToCollection?: () => void;
  onWriteReview?: () => void;
  hasReview?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Component implementation                                           */
/* ------------------------------------------------------------------ */

export function BookTrackerBookDetail({
  publication,
  onAddToCollection,
  onWriteReview,
  hasReview = false,
}: BookTrackerBookDetailProps): React.JSX.Element {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(publication.status);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [operationInProgress, setOperationInProgress] = useState(false);
  const [errorBanner, setErrorBanner] = useState('');

  const handleStatusChange = useCallback(
    async (newStatus: BookTrackerBookStatus) => {
      if (newStatus === currentStatus) return;

      setOperationInProgress(true);
      setErrorBanner('');

      try {
        await bookTrackerUpdateBookStatus(publication.id, newStatus);
        setCurrentStatus(newStatus);
      } catch (err) {
        setErrorBanner(err instanceof Error ? err.message : 'Failed to update status');
      } finally {
        setOperationInProgress(false);
      }
    },
    [publication.id, currentStatus]
  );

  const initiateDelete = useCallback(() => {
    setShowDeleteDialog(true);
  }, []);

  const cancelDelete = useCallback(() => {
    setShowDeleteDialog(false);
  }, []);

  const confirmDelete = useCallback(async () => {
    setShowDeleteDialog(false);
    setOperationInProgress(true);
    setErrorBanner('');

    try {
      await bookTrackerDeleteBook(publication.id);
      router.push('/books');
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Failed to delete book');
      setOperationInProgress(false);
    }
  }, [publication.id, router]);

  const formattedAddedDate = new Date(publication.addedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedPublicationDate = publication.publicationDate
    ? new Date(publication.publicationDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <>
      <div className="space-y-6">
        {/* Error banner */}
        {errorBanner && (
          <div
            role="alert"
            className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
          >
            {errorBanner}
          </div>
        )}

        {/* Header section */}
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Cover image + action menu */}
          <div className="flex-shrink-0 space-y-3">
            {publication.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={publication.coverImageUrl}
                alt={`Cover for ${publication.title}`}
                className="h-80 w-56 rounded-lg border border-zinc-200 object-cover shadow-lg dark:border-zinc-800"
              />
            ) : (
              <div className="flex h-80 w-56 items-center justify-center rounded-lg border border-zinc-200 bg-gradient-to-br from-zinc-200 to-zinc-300 shadow-lg dark:border-zinc-800 dark:from-zinc-700 dark:to-zinc-800">
                <span className="text-8xl font-bold text-zinc-400 dark:text-zinc-600">
                  {publication.title.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {/* Quick actions column */}
            <div className="flex w-56 flex-col gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-700 dark:bg-zinc-800/60">
              <FollowAuthorButton authorName={publication.author} variant="menu" />

              {onAddToCollection && (
                <button
                  type="button"
                  onClick={onAddToCollection}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M19 11H5m7-7v14" strokeLinecap="round" />
                  </svg>
                  Add to Collection
                </button>
              )}

              {onWriteReview && !hasReview && (
                <button
                  type="button"
                  onClick={onWriteReview}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Write a Review
                </button>
              )}

              <button
                type="button"
                onClick={initiateDelete}
                disabled={operationInProgress}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-medium text-red-400 transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-500 dark:hover:bg-red-950/30"
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Delete Book
              </button>
            </div>
          </div>

          {/* Metadata section */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                {publication.title}
              </h1>
              <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
                By {publication.author}
              </p>
            </div>

            {/* Status badge and dropdown */}
            <div className="flex flex-wrap items-center gap-3">
              <BookTrackerStatusBadge status={currentStatus} />
              {!operationInProgress && (
                <select
                  value={currentStatus}
                  onChange={(e) =>
                    handleStatusChange(Number(e.target.value) as BookTrackerBookStatus)
                  }
                  className="rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  <option value={BookTrackerBookStatus.ToRead}>To Read</option>
                  <option value={BookTrackerBookStatus.Reading}>Reading</option>
                  <option value={BookTrackerBookStatus.Completed}>Completed</option>
                </select>
              )}
            </div>

            {/* Description */}
            {publication.description && (
              <div>
                <h2 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Description
                </h2>
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {publication.description}
                </p>
              </div>
            )}

            {/* Genres */}
            {publication.genres && publication.genres.length > 0 && (
              <div>
                <h2 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Genres
                </h2>
                <div className="flex flex-wrap gap-2">
                  {publication.genres.map((genre, idx) => (
                    <span
                      key={`${genre}-${idx}`}
                      className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional details */}
            <div className="space-y-2 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
              {publication.isbn && (
                <div className="flex gap-2">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">ISBN:</span>
                  <span className="text-zinc-600 dark:text-zinc-400">{publication.isbn}</span>
                </div>
              )}
              {formattedPublicationDate && (
                <div className="flex gap-2">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">Published:</span>
                  <span className="text-zinc-600 dark:text-zinc-400">{formattedPublicationDate}</span>
                </div>
              )}
              {publication.source && (
                <div className="flex gap-2">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">Source:</span>
                  <span className="text-zinc-600 dark:text-zinc-400">{publication.source}</span>
                </div>
              )}
              <div className="flex gap-2">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">Added:</span>
                <span className="text-zinc-600 dark:text-zinc-400">{formattedAddedDate}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      <BookTrackerConfirmDialog
        isVisible={showDeleteDialog}
        title="Delete Book"
        message="Are you sure you want to remove this book from your library? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isDanger={true}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  );
}
