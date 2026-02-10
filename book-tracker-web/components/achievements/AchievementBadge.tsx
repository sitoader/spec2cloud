'use client';

/**
 * Achievement badge card with lock/unlock visual state,
 * requirement info, and unlock date.
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
  rating: 'from-emerald-400 to-teal-500',
};

const CATEGORY_ICONS: Record<string, string> = {
  milestone: '🏆',
  genre: '📚',
  speed: '⚡',
  streak: '🔥',
  rating: '⭐',
};

const CATEGORY_LABELS: Record<string, string> = {
  milestone: 'Milestone',
  genre: 'Genre Explorer',
  speed: 'Speed Reader',
  streak: 'Streak',
  rating: 'Ratings',
};

/** Turn requirementValue into a human-readable goal. */
function requirementLabel(
  category: string | undefined,
  value: number | undefined,
): string | null {
  if (value == null) return null;
  switch (category) {
    case 'milestone':
      return `Read ${value} book${value === 1 ? '' : 's'}`;
    case 'genre':
      return `Read ${value} genre${value === 1 ? '' : 's'}`;
    case 'speed':
      return `Finish in ≤ ${value} day${value === 1 ? '' : 's'}`;
    case 'streak':
      return `${value}-day streak`;
    case 'rating':
      return `Rate ${value} book${value === 1 ? '' : 's'}`;
    default:
      return `Reach ${value}`;
  }
}

export function AchievementBadge({
  achievement,
  earned,
}: AchievementBadgeProps): React.JSX.Element {
  const unlocked = !!earned;
  const gradientClass =
    CATEGORY_COLORS[achievement.category ?? ''] ?? 'from-zinc-400 to-zinc-500';
  const icon = CATEGORY_ICONS[achievement.category ?? ''] ?? '⭐';
  const catLabel = CATEGORY_LABELS[achievement.category ?? ''] ?? achievement.category;
  const reqLabel = requirementLabel(
    achievement.category,
    achievement.requirementValue,
  );

  return (
    <div
      className={`group relative flex flex-col rounded-xl border p-4 transition-all duration-200 ${
        unlocked
          ? 'border-amber-200 bg-gradient-to-b from-amber-50 to-white shadow-sm hover:shadow-md dark:border-amber-800/50 dark:from-amber-950/20 dark:to-zinc-800'
          : 'border-zinc-200 bg-zinc-50 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:border-zinc-600'
      }`}
    >
      {/* Top row: icon + info */}
      <div className="flex items-start gap-3">
        {/* Badge circle */}
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-lg ${gradientClass} ${
            unlocked ? 'shadow-md' : 'opacity-40 grayscale'
          }`}
        >
          {unlocked ? icon : '🔒'}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-semibold leading-tight ${
              unlocked
                ? 'text-zinc-900 dark:text-zinc-100'
                : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            {achievement.name}
          </p>

          {/* Category tag */}
          {catLabel && (
            <span
              className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                unlocked
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-700 dark:text-zinc-500'
              }`}
            >
              {catLabel}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {achievement.description && (
        <p
          className={`mt-2 text-xs leading-relaxed ${
            unlocked
              ? 'text-zinc-600 dark:text-zinc-400'
              : 'text-zinc-400 dark:text-zinc-500'
          }`}
        >
          {achievement.description}
        </p>
      )}

      {/* Requirement / goal */}
      {reqLabel && (
        <div
          className={`mt-2 flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium ${
            unlocked
              ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800/50 dark:bg-green-950/20 dark:text-green-400'
              : 'border-zinc-200 bg-white text-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
          }`}
        >
          {unlocked ? (
            <>
              <span className="text-green-500">✓</span>
              <span>{reqLabel}</span>
            </>
          ) : (
            <>
              <span className="text-zinc-400 dark:text-zinc-500">🎯</span>
              <span>Goal: {reqLabel}</span>
            </>
          )}
        </div>
      )}

      {/* Unlock date */}
      {earned && (
        <p className="mt-2 text-[10px] font-medium text-amber-600 dark:text-amber-400">
          ✨ Unlocked{' '}
          {new Date(earned.unlockedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      )}

      {/* Locked hint */}
      {!unlocked && (
        <p className="mt-auto pt-2 text-[10px] text-zinc-400 dark:text-zinc-500">
          Keep reading to unlock this badge
        </p>
      )}
    </div>
  );
}
