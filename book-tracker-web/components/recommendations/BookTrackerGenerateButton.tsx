'use client';

/**
 * BookTrackerGenerateButton — primary CTA for generating recommendations.
 *
 * Shows loading state during generation and is disabled while a
 * request is in progress.
 */

/* ------------------------------------------------------------------ */
/*  Interface declarations                                             */
/* ------------------------------------------------------------------ */

interface BookTrackerGenerateButtonProps {
  onClick: () => void;
  isGenerating: boolean;
  isDisabled?: boolean;
  hasExistingRecommendations: boolean;
}

/* ------------------------------------------------------------------ */
/*  Component implementation                                           */
/* ------------------------------------------------------------------ */

export function BookTrackerGenerateButton({
  onClick,
  isGenerating,
  isDisabled = false,
  hasExistingRecommendations,
}: BookTrackerGenerateButtonProps): React.JSX.Element {
  const label = hasExistingRecommendations ? 'Refresh Recommendations' : 'Get Recommendations';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isGenerating || isDisabled}
      className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
    >
      {isGenerating ? (
        <>
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-zinc-900 dark:border-t-transparent"
            aria-hidden="true"
          />
          Generating...
        </>
      ) : (
        label
      )}
    </button>
  );
}
