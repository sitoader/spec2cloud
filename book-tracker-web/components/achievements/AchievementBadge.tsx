'use client';

/**
 * BookTrackerAchievementBadge — displays an individual achievement.
 *
 * Shows locked/unlocked state with icon and description.
 */

import type { BookTrackerAchievement } from '@/types';

/* ------------------------------------------------------------------ */
/*  Interface declarations                                             */
/* ------------------------------------------------------------------ */

interface BookTrackerAchievementBadgeProps {
  achievement: BookTrackerAchievement;
  unlocked: boolean;
  unlockedAt?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function BookTrackerAchievementBadge({
  achievement,
  unlocked,
  unlockedAt,
}: BookTrackerAchievementBadgeProps): React.JSX.Element {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
        unlocked
          ? 'border-primary/50 bg-primary/5'
          : 'border-border bg-muted/30 opacity-60'
      }`}
      data-testid="achievement-badge"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-lg">
        {unlocked ? '🏆' : '🔒'}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">{achievement.name}</p>
        {achievement.description && (
          <p className="text-xs text-muted-foreground">{achievement.description}</p>
        )}
        {unlocked && unlockedAt && (
          <p className="text-xs text-primary">
            Unlocked {new Date(unlockedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}
