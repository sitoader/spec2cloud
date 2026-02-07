'use client';

/**
 * BookTrackerSearchResults — responsive grid of external book hits.
 *
 * Handles three visual states: loading skeleton, empty (no results),
 * and populated grid of BookTrackerSearchResultCard tiles.
 */

import type { BookTrackerExternalBook } from '@/types';
import BookTrackerSearchResultCard from './BookTrackerSearchResultCard';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface BookTrackerSearchResultsProps {
  hits: BookTrackerExternalBook[];
  isBusy: boolean;
  hasSearched: boolean;
  onAddToLibrary: (book: BookTrackerExternalBook, shelf: 'ToRead' | 'Reading') => Promise<void>;
  onOpenDetail: (book: BookTrackerExternalBook) => void;
}

/* ------------------------------------------------------------------ */
/*  Skeleton placeholder                                               */
/* ------------------------------------------------------------------ */

function ResultsSkeleton(): React.JSX.Element {
  return (
    <div
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      aria-label="Loading search results"
    >
      {Array.from({ length: 6 }, (_, idx) => (
        <div
          key={idx}
          className="animate-pulse overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800"
        >
          <div className="aspect-[2/3] w-full bg-zinc-200 dark:bg-zinc-700" />
          <div className="space-y-2 p-3">
            <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-3 w-1/2 rounded bg-zinc-200 dark:bg-zinc-700" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty state                                                        */
/* ------------------------------------------------------------------ */

function NoResultsBanner(): React.JSX.Element {
  return (
    <div
      className="flex min-h-[320px] items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50"
      role="status"
      aria-label="No search results"
    >
      <div className="text-center">
        <svg
          className="mx-auto h-14 w-14 text-zinc-400 dark:text-zinc-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" strokeWidth={1.5} />
          <path d="M21 21l-4.35-4.35" strokeWidth={1.5} strokeLinecap="round" />
        </svg>
        <p className="mt-4 text-base font-medium text-zinc-700 dark:text-zinc-300">
          No books found
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          Try a different title, author, or keyword
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function BookTrackerSearchResults({
  hits,
  isBusy,
  hasSearched,
  onAddToLibrary,
  onOpenDetail,
}: BookTrackerSearchResultsProps): React.JSX.Element | null {
  if (isBusy) return <ResultsSkeleton />;
  if (hasSearched && hits.length === 0) return <NoResultsBanner />;
  if (hits.length === 0) return null;

  return (
    <div
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      role="list"
      aria-label="Search results"
    >
      {hits.map((book, idx) => (
        <div key={book.externalId ?? `hit-${idx}`} role="listitem">
          <BookTrackerSearchResultCard
            externalBook={book}
            onAddToLibrary={onAddToLibrary}
            onOpenDetail={onOpenDetail}
          />
        </div>
      ))}
    </div>
  );
}
