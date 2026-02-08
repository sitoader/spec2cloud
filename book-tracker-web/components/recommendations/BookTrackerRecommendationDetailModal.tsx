'use client';

/**
 * BookTrackerRecommendationDetailModal — full-detail overlay for an AI-recommended book.
 *
 * Shows cover, metadata, AI reason, confidence score, and description
 * from external catalogue (Google Books / Open Library).
 * Uses the native <dialog> element for accessibility and focus trapping.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { BookTrackerBookRecommendation } from '@/types';
import BookTrackerRatingStars from '@/components/ratings/BookTrackerRatingStars';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface BookTrackerRecommendationDetailModalProps {
  recommendation: BookTrackerBookRecommendation | null;
  isAdded: boolean;
  onDismiss: () => void;
  onAddToTbr: () => Promise<void>;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function coverInitial(headline: string): string {
  const ch = headline.trim().charAt(0);
  return /^[a-zA-Z]$/.test(ch) ? ch.toUpperCase() : '📖';
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function BookTrackerRecommendationDetailModal({
  recommendation,
  isAdded,
  onDismiss,
  onAddToTbr,
}: BookTrackerRecommendationDetailModalProps): React.JSX.Element | null {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isAdding, setIsAdding] = useState(false);

  const isOpen = recommendation !== null;

  /* Synchronise native dialog visibility */
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (isOpen && !el.open) el.showModal();
    else if (!isOpen && el.open) el.close();
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (evt: React.KeyboardEvent<HTMLDialogElement>): void => {
      if (evt.key === 'Escape') onDismiss();
    },
    [onDismiss],
  );

  const handleAdd = useCallback(async (): Promise<void> => {
    setIsAdding(true);
    try {
      await onAddToTbr();
    } catch {
      // Parent handles error display
    } finally {
      setIsAdding(false);
    }
  }, [onAddToTbr]);

  if (!isOpen) return null;

  const rec = recommendation;

  return (
    <dialog
      ref={dialogRef}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 m-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-0 shadow-2xl backdrop:bg-black/50 dark:bg-zinc-800"
      aria-labelledby="bt-rec-detail-title"
    >
      {/* Close button */}
      <div className="sticky top-0 z-10 flex justify-end bg-white/90 p-3 backdrop-blur dark:bg-zinc-800/90">
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Close detail view"
          className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="px-6 pb-6">
        {/* Top section: cover + primary info */}
        <div className="flex flex-col gap-5 sm:flex-row">
          {/* Cover */}
          <div className="flex-shrink-0">
            <div className="mx-auto h-56 w-36 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-700 sm:mx-0">
              {rec.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={rec.coverImageUrl}
                  alt={`Cover of ${rec.title}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-200 to-zinc-300 text-5xl font-bold text-zinc-400 dark:from-zinc-700 dark:to-zinc-800 dark:text-zinc-500">
                  {coverInitial(rec.title)}
                </span>
              )}
            </div>
          </div>

          {/* Primary info */}
          <div className="flex flex-1 flex-col">
            <h2
              id="bt-rec-detail-title"
              className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              {rec.title}
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              by {rec.author}
            </p>

            {/* Metadata chips */}
            <dl className="mt-3 space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
              {rec.publicationYear && (
                <div className="flex gap-1">
                  <dt className="font-medium">Published:</dt>
                  <dd>{rec.publicationYear}</dd>
                </div>
              )}
              {rec.isbn && (
                <div className="flex gap-1">
                  <dt className="font-medium">ISBN:</dt>
                  <dd>{rec.isbn}</dd>
                </div>
              )}
              {rec.source && (
                <div className="flex gap-1">
                  <dt className="font-medium">Source:</dt>
                  <dd>{rec.source}</dd>
                </div>
              )}
            </dl>

            {/* Genre badges */}
            {(rec.genres ?? (rec.genre ? [rec.genre] : [])).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(rec.genres ?? (rec.genre ? [rec.genre] : [])).map((g) => (
                  <span
                    key={g}
                    className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* AI confidence */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-500">AI Confidence:</span>
              <BookTrackerRatingStars
                value={Math.round(rec.confidenceScore)}
                readOnly
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* AI Reason */}
        <div className="mt-5 rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-950/50">
          <h3 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">
            Why this was recommended
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-indigo-700 dark:text-indigo-400">
            {rec.reason}
          </p>
        </div>

        {/* Description */}
        {rec.description && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Description
            </h3>
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {rec.description}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-6 flex gap-3">
          {isAdded ? (
            <div className="flex flex-1 items-center justify-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Added to TBR
            </div>
          ) : (
            <button
              type="button"
              disabled={isAdding}
              onClick={(): void => { void handleAdd(); }}
              className="flex-1 rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              {isAdding ? 'Adding...' : 'Add to TBR'}
            </button>
          )}
          <button
            type="button"
            onClick={onDismiss}
            className="flex-1 rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}
