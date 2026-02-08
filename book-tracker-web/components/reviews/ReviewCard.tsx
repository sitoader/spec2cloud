'use client';

/**
 * Review card with tags, mood, and recommendation indicators.
 */

import type { BookTrackerBookReview } from '@/types';

interface ReviewCardProps {
  review: BookTrackerBookReview;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ReviewCard({
  review,
  onEdit,
  onDelete,
}: ReviewCardProps): React.JSX.Element {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Stars */}
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-sm ${
                  star <= review.rating
                    ? 'text-amber-400'
                    : 'text-zinc-300 dark:text-zinc-600'
                }`}
              >
                ★
              </span>
            ))}
          </div>
          {review.wouldRecommend && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              👍 Recommended
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!review.isPublic && (
            <span className="text-[10px] text-zinc-400">🔒 Private</span>
          )}
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {new Date(review.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* Reviewer name */}
      {review.reviewerDisplayName && (
        <p className="mt-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Review by {review.reviewerDisplayName}
        </p>
      )}

      {/* Review text */}
      {review.reviewText && (
        <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {review.reviewText}
        </p>
      )}

      {/* Mood */}
      {review.mood && (
        <div className="mt-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
            <span className="text-[10px] text-purple-400 dark:text-purple-500">Mood</span>
            <span className="capitalize">{review.mood}</span>
          </span>
        </div>
      )}

      {/* Tags */}
      {review.tags && review.tags.length > 0 && (
        <div className={`${review.mood ? 'mt-2' : 'mt-3'} flex flex-wrap items-center gap-2`}>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Tags</span>
          {review.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
