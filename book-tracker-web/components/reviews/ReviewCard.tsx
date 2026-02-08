'use client';

/**
 * BookTrackerReviewCard — displays an enhanced book review.
 *
 * Shows rating, review text, tags, mood, and recommendation status.
 */

import type { BookTrackerBookReview } from '@/types';

/* ------------------------------------------------------------------ */
/*  Interface declarations                                             */
/* ------------------------------------------------------------------ */

interface BookTrackerReviewCardProps {
  review: BookTrackerBookReview;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function renderStars(rating: number): string {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function BookTrackerReviewCard({
  review,
}: BookTrackerReviewCardProps): React.JSX.Element {
  return (
    <div
      className="rounded-lg border border-border bg-card p-4"
      data-testid="review-card"
    >
      <div className="flex items-center justify-between">
        <span className="text-lg text-yellow-500">{renderStars(review.rating)}</span>
        {review.wouldRecommend !== undefined && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              review.wouldRecommend
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
            }`}
          >
            {review.wouldRecommend ? '👍 Recommended' : '👎 Not recommended'}
          </span>
        )}
      </div>

      {review.mood && (
        <p className="mt-1 text-xs text-muted-foreground">
          Mood: <span className="font-medium">{review.mood}</span>
        </p>
      )}

      {review.reviewText && (
        <p className="mt-3 text-sm text-foreground">{review.reviewText}</p>
      )}

      {review.tags && review.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {review.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 text-xs text-muted-foreground">
        {new Date(review.createdAt).toLocaleDateString()}
        {!review.isPublic && (
          <span className="ml-2 rounded bg-gray-100 px-1 dark:bg-gray-800">Private</span>
        )}
      </div>
    </div>
  );
}
