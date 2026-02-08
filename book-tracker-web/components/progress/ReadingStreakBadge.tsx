'use client';

/**
 * Reading streak badge with fire emoji and streak stats.
 */

import type { BookTrackerReadingStreak } from '@/types';

interface ReadingStreakBadgeProps {
  streak: BookTrackerReadingStreak | null;
}

export function ReadingStreakBadge({ streak }: ReadingStreakBadgeProps): React.JSX.Element {
  const current = streak?.currentStreak ?? 0;
  const longest = streak?.longestStreak ?? 0;

  const flameSize = current >= 30 ? 'text-4xl' : current >= 7 ? 'text-3xl' : 'text-2xl';

  return (
    <div className="flex items-center gap-3 rounded-lg border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3 dark:border-orange-800/50 dark:from-orange-950/30 dark:to-amber-950/30">
      <span className={`${flameSize} transition-all duration-300`} role="img" aria-label="streak">
        🔥
      </span>
      <div className="flex-1">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-orange-700 dark:text-orange-400">
            {current}
          </span>
          <span className="text-sm text-orange-600 dark:text-orange-500">
            day{current !== 1 ? 's' : ''} streak
          </span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Longest: {longest} day{longest !== 1 ? 's' : ''}
          {streak?.lastReadDate && (
            <>
              {' · '}Last read:{' '}
              {new Date(streak.lastReadDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </>
          )}
        </p>
      </div>
    </div>
  );
}
