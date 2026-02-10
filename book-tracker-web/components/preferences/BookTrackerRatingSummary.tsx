'use client';

/**
 * BookTrackerRatingSummary — displays rating statistics.
 *
 * Shows total books rated, average rating, and distribution chart.
 */

import Link from 'next/link';
import type { BookTrackerBook } from '@/types';

/* ------------------------------------------------------------------ */
/*  Interface declarations                                             */
/* ------------------------------------------------------------------ */

interface BookTrackerRatingSummaryProps {
  /** All books from the user's library. */
  books: BookTrackerBook[];
}

/* ------------------------------------------------------------------ */
/*  Component implementation                                           */
/* ------------------------------------------------------------------ */

export default function BookTrackerRatingSummary({
  books,
}: BookTrackerRatingSummaryProps): React.JSX.Element {
  const ratedBooks = books.filter((b) => b.rating && b.rating.score > 0);
  const totalRated = ratedBooks.length;

  const averageRating =
    totalRated > 0
      ? ratedBooks.reduce((sum, b) => sum + (b.rating?.score ?? 0), 0) / totalRated
      : 0;

  // Distribution: count of ratings per star level
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: ratedBooks.filter((b) => b.rating?.score === star).length,
  }));

  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  return (
    <div className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Rating Summary
      </h3>

      {/* Stats row */}
      <div className="flex gap-6">
        <Link
          href="/books?filter=rated"
          className="group cursor-pointer"
        >
          <p className="text-2xl font-bold text-zinc-900 group-hover:text-amber-600 dark:text-zinc-100 dark:group-hover:text-amber-400 transition-colors">{totalRated}</p>
          <p className="text-xs text-zinc-500 group-hover:text-amber-600 dark:text-zinc-400 dark:group-hover:text-amber-400 transition-colors underline-offset-2 group-hover:underline">Books Rated</p>
        </Link>
        <div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {totalRated > 0 ? averageRating.toFixed(1) : '—'}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Average Rating</p>
        </div>
      </div>

      {/* Distribution chart */}
      {totalRated > 0 && (
        <div className="space-y-1.5">
          {distribution.map(({ star, count }) => (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="w-12 text-right text-zinc-600 dark:text-zinc-400">
                {star} {'★'}
              </span>
              <div className="flex-1">
                <div className="h-4 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-700">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
              <span className="w-8 text-right text-zinc-500 dark:text-zinc-400">{count}</span>
            </div>
          ))}
        </div>
      )}

      {/* Link to rate more */}
      {totalRated < 3 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Rate at least 3 books to unlock better recommendations.{' '}
          <Link
            href="/books"
            className="font-medium text-zinc-700 underline hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            Browse your library →
          </Link>
        </p>
      )}
    </div>
  );
}
