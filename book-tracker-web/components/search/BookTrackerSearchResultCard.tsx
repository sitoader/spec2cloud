'use client';

/**
 * BookTrackerSearchResultCard — single tile for an externally-sourced book.
 *
 * Renders cover art (with a letter-glyph fallback), metadata,
 * and quick-add action buttons that let the user shelve the book
 * directly from the search results grid.
 */

import { useCallback, useState } from 'react';
import type { BookTrackerExternalBook } from '@/types';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface BookTrackerSearchResultCardProps {
  externalBook: BookTrackerExternalBook;
  onAddToLibrary: (book: BookTrackerExternalBook, shelf: 'ToRead' | 'Reading') => Promise<void>;
  onOpenDetail: (book: BookTrackerExternalBook) => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const SYNOPSIS_CAP = 120;

function abbreviateSynopsis(raw: string | undefined): string {
  if (!raw || raw.length === 0) return '';
  if (raw.length <= SYNOPSIS_CAP) return raw;
  const spaceIdx = raw.lastIndexOf(' ', SYNOPSIS_CAP);
  return raw.slice(0, spaceIdx > 0 ? spaceIdx : SYNOPSIS_CAP) + '…';
}

function coverGlyph(headline: string): string {
  const ch = headline.trim().charAt(0);
  return /^[a-zA-Z]$/.test(ch) ? ch.toUpperCase() : '📖';
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function BookTrackerSearchResultCard({
  externalBook,
  onAddToLibrary,
  onOpenDetail,
}: BookTrackerSearchResultCardProps): React.JSX.Element {
  const [addingAs, setAddingAs] = useState<'ToRead' | 'Reading' | null>(null);

  const handleAdd = useCallback(
    async (shelf: 'ToRead' | 'Reading'): Promise<void> => {
      setAddingAs(shelf);
      try {
        await onAddToLibrary(externalBook, shelf);
      } finally {
        setAddingAs(null);
      }
    },
    [externalBook, onAddToLibrary],
  );

  const snippet = abbreviateSynopsis(externalBook.description);

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
      aria-label={`Search result: ${externalBook.title}`}
    >
      {/* Clickable cover + metadata area */}
      <button
        type="button"
        onClick={(): void => onOpenDetail(externalBook)}
        className="flex flex-1 flex-col text-left focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
      >
        {/* Cover image */}
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {externalBook.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={externalBook.coverImageUrl}
              alt={`Cover of ${externalBook.title}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-200 to-zinc-300 text-5xl font-bold text-zinc-400 dark:from-zinc-700 dark:to-zinc-800 dark:text-zinc-500">
              {coverGlyph(externalBook.title)}
            </span>
          )}

          {/* Source pill */}
          <span className="absolute left-2 top-2 rounded-full bg-zinc-900/70 px-2 py-0.5 text-[10px] font-medium text-white dark:bg-zinc-200/80 dark:text-zinc-900">
            {externalBook.source}
          </span>
        </div>

        {/* Text metadata */}
        <div className="flex flex-1 flex-col gap-1 p-3">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
            {externalBook.title}
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            {externalBook.author}
          </p>
          {externalBook.publicationYear && (
            <p className="text-[11px] text-zinc-500 dark:text-zinc-500">
              {externalBook.publicationYear}
            </p>
          )}
          {snippet && (
            <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-zinc-500 dark:text-zinc-500">
              {snippet}
            </p>
          )}
          {externalBook.genres && externalBook.genres.length > 0 && (
            <div className="mt-auto flex flex-wrap gap-1 pt-1">
              {externalBook.genres.slice(0, 3).map((genre) => (
                <span
                  key={genre}
                  className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>
      </button>

      {/* Quick-add action bar */}
      <div className="flex border-t border-zinc-200 dark:border-zinc-700">
        <button
          type="button"
          disabled={addingAs !== null}
          onClick={(): void => { void handleAdd('ToRead'); }}
          className="flex-1 px-2 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {addingAs === 'ToRead' ? 'Adding…' : '+ To Read'}
        </button>
        <span className="w-px bg-zinc-200 dark:bg-zinc-700" aria-hidden="true" />
        <button
          type="button"
          disabled={addingAs !== null}
          onClick={(): void => { void handleAdd('Reading'); }}
          className="flex-1 px-2 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {addingAs === 'Reading' ? 'Adding…' : '+ Reading'}
        </button>
      </div>
    </article>
  );
}
