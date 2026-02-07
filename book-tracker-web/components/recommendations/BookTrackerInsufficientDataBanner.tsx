'use client';

/**
 * BookTrackerInsufficientDataBanner — shown when user lacks enough
 * rated books to generate AI recommendations.
 *
 * Displays progress toward the minimum (3 rated books) and provides
 * a link to the library page where the user can rate more books.
 */

import Link from 'next/link';

/* ------------------------------------------------------------------ */
/*  Interface declarations                                             */
/* ------------------------------------------------------------------ */

interface BookTrackerInsufficientDataBannerProps {
  ratedCount: number;
}

/* ------------------------------------------------------------------ */
/*  Component implementation                                           */
/* ------------------------------------------------------------------ */

const MINIMUM_RATED = 3;

export function BookTrackerInsufficientDataBanner({
  ratedCount,
}: BookTrackerInsufficientDataBannerProps): React.JSX.Element {
  const remaining = Math.max(0, MINIMUM_RATED - ratedCount);

  return (
    <div
      role="alert"
      className="rounded-lg border border-amber-300 bg-amber-50 p-6 dark:border-amber-700 dark:bg-amber-950"
    >
      <h3 className="text-base font-semibold text-amber-900 dark:text-amber-200">
        Rate at least 3 books to unlock AI recommendations
      </h3>
      <p className="mt-2 text-sm text-amber-800 dark:text-amber-300">
        You&apos;ve rated {ratedCount} of {MINIMUM_RATED} books.{' '}
        {remaining > 0 && `Rate ${remaining} more ${remaining === 1 ? 'book' : 'books'} to get started.`}
      </p>

      {/* Progress bar */}
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-amber-200 dark:bg-amber-800">
        <div
          className="h-full rounded-full bg-amber-500 transition-all dark:bg-amber-400"
          style={{ width: `${Math.min(100, (ratedCount / MINIMUM_RATED) * 100)}%` }}
        />
      </div>

      <Link
        href="/books"
        className="mt-4 inline-flex items-center rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
      >
        Go to Library
      </Link>
    </div>
  );
}
