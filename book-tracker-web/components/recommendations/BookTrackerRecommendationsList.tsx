'use client';

/**
 * BookTrackerRecommendationsList — grid of recommendation cards.
 *
 * Displays AI-generated book recommendations in a responsive grid,
 * with loading skeleton, empty state fallbacks, and a detail modal.
 */

import { useState } from 'react';
import type { BookTrackerBookRecommendation } from '@/types';
import { BookTrackerRecommendationCard } from './BookTrackerRecommendationCard';
import { BookTrackerRecommendationLoading } from './BookTrackerRecommendationLoading';
import BookTrackerRecommendationDetailModal from './BookTrackerRecommendationDetailModal';

/* ------------------------------------------------------------------ */
/*  Interface declarations                                             */
/* ------------------------------------------------------------------ */

interface BookTrackerRecommendationsListProps {
  recommendations: BookTrackerBookRecommendation[];
  isLoading: boolean;
  addedTitles: Set<string>;
  onAddToTbr: (rec: BookTrackerBookRecommendation) => Promise<void>;
  onDismiss: (rec: BookTrackerBookRecommendation) => void;
}

/* ------------------------------------------------------------------ */
/*  Component implementation                                           */
/* ------------------------------------------------------------------ */

export function BookTrackerRecommendationsList({
  recommendations,
  isLoading,
  addedTitles,
  onAddToTbr,
  onDismiss,
}: BookTrackerRecommendationsListProps): React.JSX.Element {
  const [detailRec, setDetailRec] = useState<BookTrackerBookRecommendation | null>(null);

  if (isLoading) {
    return <BookTrackerRecommendationLoading />;
  }

  if (recommendations.length === 0) {
    return (
      <div
        className="flex min-h-[300px] items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50"
        role="status"
        aria-label="No recommendations"
      >
        <div className="text-center">
          <p className="text-base font-medium text-zinc-700 dark:text-zinc-300">
            No recommendations yet
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
            Click &quot;Get Recommendations&quot; to discover books you&apos;ll love
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        role="list"
        aria-label="Book recommendations"
      >
        {recommendations.map((rec) => (
          <div key={`${rec.title}-${rec.author}`} role="listitem">
            <BookTrackerRecommendationCard
              title={rec.title}
              author={rec.author}
              genre={rec.genre}
              reason={rec.reason}
              confidenceScore={rec.confidenceScore}
              coverImageUrl={rec.coverImageUrl}
              isAdded={addedTitles.has(rec.title)}
              onViewDetails={(): void => {
                setDetailRec(rec);
              }}
              onAddToTbr={async (): Promise<void> => {
                await onAddToTbr(rec);
              }}
              onDismiss={(): void => {
                onDismiss(rec);
              }}
            />
          </div>
        ))}
      </div>

      {/* Detail modal */}
      <BookTrackerRecommendationDetailModal
        recommendation={detailRec}
        isAdded={detailRec ? addedTitles.has(detailRec.title) : false}
        onDismiss={(): void => {
          setDetailRec(null);
        }}
        onAddToTbr={async (): Promise<void> => {
          if (detailRec) {
            await onAddToTbr(detailRec);
          }
        }}
      />
    </>
  );
}
