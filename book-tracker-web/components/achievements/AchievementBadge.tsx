'use client';

/**
 * Achievement badge with lock/unlock visual state.
 */

import type { BookTrackerAchievement, BookTrackerUserAchievement } from '@/types';

interface AchievementBadgeProps {
  achievement: BookTrackerAchievement;
  earned?: BookTrackerUserAchievement;
}

const CATEGORY_COLORS: Record<string, string> = {
  milestone: 'from-amber-400 to-yellow-500',
  genre: 'from-purple-400 to-indigo-500',
  speed: 'from-cyan-400 to-blue-500',
  streak: 'from-orange-400 to-red-500',
};

const CATEGORY_ICONS: Record<string, string> = {
  milestone: '🏆',
  genre: '📚',
  speed: '⚡',
  streak: '🔥',
};

export function AchievementBadge({
  achievement,
  earned,
}: AchievementBadgeProps): React.JSX.Element {
  const unlocked = !!earned;
  const gradientClass = CATEGORY_COLORS[achievement.category ?? ''] ?? 'from-zinc-400 to-zinc-500';
  const icon = CATEGORY_ICONS[achievement.category ?? ''] ?? '⭐';

  return (
    <div
      className={`group relative flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all duration-200 ${
        unlocked
          ? 'border-amber-200 bg-gradient-to-b from-amber-50 to-white shadow-sm hover:shadow-md dark:border-amber-800/50 dark:from-amber-950/20 dark:to-zinc-800'
          : 'border-zinc-200 bg-zinc-50 opacity-60 grayscale dark:border-zinc-700 dark:bg-zinc-800/50'
      }`}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-xl ${gradientClass} ${
          unlocked ? 'shadow-lg' : ''
        }`}
      >
        {unlocked ? icon : '🔒'}
      </div>
      <div>
        <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
          {achievement.name}
        </p>
        {achievement.description && (
          <p className="mt-0.5 text-[10px] text-zinc-500 dark:text-zinc-400">
            {achievement.description}
          </p>
        )}
      </div>
      {earned && (
        <p className="text-[10px] text-amber-600 dark:text-amber-400">
          Unlocked{' '}
          {new Date(earned.unlockedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      )}
    </div>
  );
}
