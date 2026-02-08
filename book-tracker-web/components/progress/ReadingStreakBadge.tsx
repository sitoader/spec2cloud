'use client';

/**
 * BookTrackerReadingStreakBadge — displays the user's current reading streak.
 *
 * Shows fire emoji with streak count and longest streak record.
 */

import type { BookTrackerReadingStreak } from '@/types';

/* ------------------------------------------------------------------ */
/*  Interface declarations                                             */
/* ------------------------------------------------------------------ */

interface BookTrackerReadingStreakBadgeProps {
  streak: BookTrackerReadingStreak;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function BookTrackerReadingStreakBadge({
  streak,
}: BookTrackerReadingStreakBadgeProps): React.JSX.Element {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 dark:bg-orange-900/30"
      data-testid="reading-streak-badge"
    >
      <span className="text-lg" role="img" aria-label="fire">
        🔥
      </span>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
          {streak.currentStreak} day{streak.currentStreak !== 1 ? 's' : ''}
        </span>
        <span className="text-xs text-orange-600/70 dark:text-orange-400/70">
          Best: {streak.longestStreak} day{streak.longestStreak !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
