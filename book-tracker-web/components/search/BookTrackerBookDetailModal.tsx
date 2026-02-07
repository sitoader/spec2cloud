'use client';

/**
 * BookTrackerBookDetailModal — full-detail overlay for an external book.
 *
 * Uses the native <dialog> element for accessibility and focus
 * trapping, matching the pattern from BookTrackerConfirmDialog.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { BookTrackerExternalBook } from '@/types';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface BookTrackerBookDetailModalProps {
  externalBook: BookTrackerExternalBook | null;
  onDismiss: () => void;
  onAddToLibrary: (book: BookTrackerExternalBook, shelf: 'ToRead' | 'Reading') => Promise<void>;
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

export default function BookTrackerBookDetailModal({
  externalBook,
  onDismiss,
  onAddToLibrary,
}: BookTrackerBookDetailModalProps): React.JSX.Element | null {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [addingAs, setAddingAs] = useState<'ToRead' | 'Reading' | null>(null);

  const isOpen = externalBook !== null;

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

  const handleShelfAdd = useCallback(
    async (shelf: 'ToRead' | 'Reading'): Promise<void> => {
      if (!externalBook) return;
      setAddingAs(shelf);
      try {
        await onAddToLibrary(externalBook, shelf);
        onDismiss();
      } finally {
        setAddingAs(null);
      }
    },
    [externalBook, onAddToLibrary, onDismiss],
  );

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 m-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-0 shadow-2xl backdrop:bg-black/50 dark:bg-zinc-800"
      aria-labelledby="bt-detail-modal-title"
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
              {externalBook.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={externalBook.coverImageUrl}
                  alt={`Cover of ${externalBook.title}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-200 to-zinc-300 text-5xl font-bold text-zinc-400 dark:from-zinc-700 dark:to-zinc-800 dark:text-zinc-500">
                  {coverInitial(externalBook.title)}
                </span>
              )}
            </div>
          </div>

          {/* Primary info */}
          <div className="flex flex-1 flex-col">
            <h2
              id="bt-detail-modal-title"
              className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              {externalBook.title}
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              by {externalBook.author}
            </p>

            {/* Metadata chips */}
            <dl className="mt-3 space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
              {externalBook.publicationYear && (
                <div className="flex gap-1">
                  <dt className="font-medium">Published:</dt>
                  <dd>{externalBook.publicationYear}</dd>
                </div>
              )}
              {externalBook.isbn && (
                <div className="flex gap-1">
                  <dt className="font-medium">ISBN:</dt>
                  <dd>{externalBook.isbn}</dd>
                </div>
              )}
              <div className="flex gap-1">
                <dt className="font-medium">Source:</dt>
                <dd>{externalBook.source}</dd>
              </div>
            </dl>

            {externalBook.genres && externalBook.genres.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {externalBook.genres.map((g) => (
                  <span
                    key={g}
                    className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {externalBook.description && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Description
            </h3>
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {externalBook.description}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            disabled={addingAs !== null}
            onClick={(): void => { void handleShelfAdd('ToRead'); }}
            className="flex-1 rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {addingAs === 'ToRead' ? 'Adding…' : 'Add to Read'}
          </button>
          <button
            type="button"
            disabled={addingAs !== null}
            onClick={(): void => { void handleShelfAdd('Reading'); }}
            className="flex-1 rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            {addingAs === 'Reading' ? 'Adding…' : 'Start Reading'}
          </button>
        </div>
      </div>
    </dialog>
  );
}
