'use client';

/**
 * BookTrackerReadingProgressBar — visual progress indicator for book reading.
 *
 * Displays current page, total pages, and percentage completion
 * with an animated progress bar.
 */

import type { BookTrackerReadingProgress } from '@/types';

/* ------------------------------------------------------------------ */
/*  Interface declarations                                             */
/* ------------------------------------------------------------------ */

interface BookTrackerReadingProgressBarProps {
  progress: BookTrackerReadingProgress;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function BookTrackerReadingProgressBar({
  progress,
}: BookTrackerReadingProgressBarProps): React.JSX.Element {
  const percentage = Math.min(100, Math.max(0, progress.progressPercentage));
  const pagesLabel = progress.totalPages
    ? `${progress.currentPage} / ${progress.totalPages} pages`
    : `${progress.currentPage} pages read`;

  return (
    <div className="space-y-2" data-testid="reading-progress-bar">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{pagesLabel}</span>
        <span className="font-medium">{percentage.toFixed(0)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Reading progress: ${percentage.toFixed(0)}%`}
        />
      </div>
      {progress.estimatedCompletionDate && (
        <p className="text-xs text-muted-foreground">
          Estimated completion:{' '}
          {new Date(progress.estimatedCompletionDate).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
