'use client';

/**
 * BookTrackerRecommendationLoading — loading state displayed while
 * AI recommendations are being generated.
 *
 * Shows an animated spinner and a friendly message.
 */

/* ------------------------------------------------------------------ */
/*  Component implementation                                           */
/* ------------------------------------------------------------------ */

export function BookTrackerRecommendationLoading(): React.JSX.Element {
  return (
    <div
      className="flex min-h-[300px] items-center justify-center"
      role="status"
      aria-label="Generating recommendations"
    >
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-800 dark:border-t-zinc-200" />
        <p className="mt-4 text-base font-medium text-zinc-700 dark:text-zinc-300">
          Discovering books you&apos;ll love...
        </p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
          This may take a few seconds
        </p>
      </div>
    </div>
  );
}
