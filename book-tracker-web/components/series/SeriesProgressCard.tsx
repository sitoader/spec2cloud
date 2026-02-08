'use client';

/**
 * Series progress card showing read status across a series.
 */

import type { BookTrackerBookSeries, BookTrackerBook } from '@/types';

interface SeriesProgressCardProps {
  series: BookTrackerBookSeries;
  /** Map of bookId → book for resolving series entry titles/status */
  booksMap?: Map<string, BookTrackerBook>;
}

export function SeriesProgressCard({
  series,
  booksMap,
}: SeriesProgressCardProps): React.JSX.Element {
  const entries = series.entries
    ? [...series.entries].sort((a, b) => a.positionInSeries - b.positionInSeries)
    : [];

  const total = series.totalBooks ?? entries.length;
  const readCount = entries.filter((e) => {
    const book = booksMap?.get(e.bookId);
    return book && book.status === 2; // Completed
  }).length;

  const percentage = total > 0 ? (readCount / total) * 100 : 0;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          📖 {series.name}
        </h3>
        <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
          {readCount}/{total}
        </span>
      </div>

      {series.description && (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {series.description}
        </p>
      )}

      {/* Progress bar */}
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Book entries */}
      {entries.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {entries.map((entry) => {
            const book = booksMap?.get(entry.bookId);
            const isRead = book && book.status === 2;
            return (
              <div
                key={entry.id}
                className="flex items-center gap-2 text-xs"
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    isRead
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400'
                  }`}
                >
                  {isRead ? '✓' : entry.positionInSeries}
                </span>
                <span
                  className={`flex-1 ${
                    isRead
                      ? 'text-zinc-500 line-through dark:text-zinc-400'
                      : 'text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {book?.title ?? `Book #${entry.positionInSeries}`}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
