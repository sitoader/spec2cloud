'use client';

/**
 * BookTrackerRecommendationCard — individual recommendation tile.
 *
 * Displays a single AI-generated book recommendation with its title,
 * author, genre, explanation, confidence score, and action buttons.
 */

import { useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Interface declarations                                             */
/* ------------------------------------------------------------------ */

interface BookTrackerRecommendationCardProps {
  title: string;
  author: string;
  genre?: string;
  reason: string;
  confidenceScore: number;
  onAddToTbr: () => Promise<void>;
  onDismiss: () => void;
  isAdded?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function renderConfidenceStars(score: number): React.JSX.Element {
  const stars: React.JSX.Element[] = [];
  const clamped = Math.max(1, Math.min(5, Math.round(score)));
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span
        key={i}
        className={i <= clamped ? 'text-yellow-400' : 'text-zinc-300 dark:text-zinc-600'}
        aria-hidden="true"
      >
        ★
      </span>,
    );
  }
  return (
    <span aria-label={`Confidence: ${clamped} out of 5`} className="text-lg">
      {stars}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Component implementation                                           */
/* ------------------------------------------------------------------ */

export function BookTrackerRecommendationCard({
  title,
  author,
  genre,
  reason,
  confidenceScore,
  onAddToTbr,
  onDismiss,
  isAdded = false,
}: BookTrackerRecommendationCardProps): React.JSX.Element {
  const [isAdding, setIsAdding] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const handleAdd = async (): Promise<void> => {
    setIsAdding(true);
    try {
      await onAddToTbr();
    } finally {
      setIsAdding(false);
    }
  };

  const handleDismiss = (): void => {
    setIsDismissed(true);
    onDismiss();
  };

  if (isDismissed) return <></>;

  return (
    <article className="flex flex-col rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            By {author}
          </p>
        </div>
        {genre && (
          <span className="shrink-0 rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {genre}
          </span>
        )}
      </div>

      {/* Confidence */}
      <div className="mb-3">{renderConfidenceStars(confidenceScore)}</div>

      {/* Reason */}
      <p className="mb-4 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {reason}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {isAdded ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
            ✓ Added
          </span>
        ) : (
          <button
            type="button"
            onClick={(): void => {
              void handleAdd();
            }}
            disabled={isAdding}
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {isAdding ? 'Adding...' : 'Add to TBR'}
          </button>
        )}
        {!isAdded && (
          <button
            type="button"
            onClick={handleDismiss}
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            Not Interested
          </button>
        )}
      </div>
    </article>
  );
}
