'use client';

/**
 * BookTrackerBookGrid — collection display orchestrator.
 *
 * Renders book arrays through responsive grid allocation with
 * adaptive column density and vacancy state visualization.
 */

import type { BookTrackerBook } from '@/types';
import { BookTrackerBookCard } from './BookCard';

/* ------------------------------------------------------------------ */
/*  Interface declarations                                             */
/* ------------------------------------------------------------------ */

interface BookTrackerBookGridProps {
  publicationSet: BookTrackerBook[];
  emptyStateText?: string;
}

/* ------------------------------------------------------------------ */
/*  Component implementation                                           */
/* ------------------------------------------------------------------ */

export function BookTrackerBookGrid({
  publicationSet,
  emptyStateText = 'Your library awaits its first entry',
}: BookTrackerBookGridProps): React.JSX.Element {
  const hasNoPublications = publicationSet.length === 0;

  if (hasNoPublications) {
    return (
      <div
        className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50"
        role="status"
        aria-label="Empty library state"
      >
        <div className="text-center">
          <svg
            className="mx-auto h-16 w-16 text-zinc-400 dark:text-zinc-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <p className="mt-4 text-base font-medium text-zinc-700 dark:text-zinc-300">
            {emptyStateText}
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
            Add your first book to begin tracking your reading journey
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
      role="list"
      aria-label="Books collection"
    >
      {publicationSet.map((pub) => (
        <div key={pub.id} role="listitem">
          <BookTrackerBookCard publication={pub} />
        </div>
      ))}
    </div>
  );
}
