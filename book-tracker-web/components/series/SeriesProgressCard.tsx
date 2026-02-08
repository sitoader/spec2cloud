'use client';

/**
 * BookTrackerSeriesProgressCard — displays series reading progress.
 *
 * Shows series name, number of books read vs total, and progress bar.
 */

import type { BookTrackerBookSeries } from '@/types';

/* ------------------------------------------------------------------ */
/*  Interface declarations                                             */
/* ------------------------------------------------------------------ */

interface BookTrackerSeriesProgressCardProps {
  series: BookTrackerBookSeries;
  readBookIds?: Set<string>;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function BookTrackerSeriesProgressCard({
  series,
  readBookIds = new Set(),
}: BookTrackerSeriesProgressCardProps): React.JSX.Element {
  const totalInSeries = series.totalBooks ?? series.entries.length;
  const readCount = series.entries.filter((e) => readBookIds.has(e.bookId)).length;
  const percentage = totalInSeries > 0
    ? Math.round((readCount / totalInSeries) * 100)
    : 0;

  return (
    <div
      className="rounded-lg border border-border bg-card p-4"
      data-testid="series-progress-card"
    >
      <h3 className="text-lg font-semibold text-foreground">{series.name}</h3>
      {series.description && (
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {series.description}
        </p>
      )}
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {readCount} / {totalInSeries} books read
          </span>
          <span className="font-medium text-foreground">{percentage}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
      {series.entries.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-muted-foreground">Books in series:</p>
          <ol className="mt-1 space-y-1">
            {series.entries
              .sort((a, b) => a.positionInSeries - b.positionInSeries)
              .map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center gap-2 text-xs text-foreground"
                >
                  <span className="text-muted-foreground">
                    #{entry.positionInSeries}
                  </span>
                  {readBookIds.has(entry.bookId) ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    <span className="text-muted-foreground">○</span>
                  )}
                </li>
              ))}
          </ol>
        </div>
      )}
    </div>
  );
}
