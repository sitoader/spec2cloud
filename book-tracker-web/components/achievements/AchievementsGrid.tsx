'use client';

/**
 * BookTrackerAchievementsGrid — displays a grid of all achievements.
 *
 * Shows locked and unlocked achievements with filtering by category.
 */

import { useState, useMemo } from 'react';
import type { BookTrackerAchievement, BookTrackerUserAchievement } from '@/types';
import { BookTrackerAchievementBadge } from './AchievementBadge';

/* ------------------------------------------------------------------ */
/*  Interface declarations                                             */
/* ------------------------------------------------------------------ */

interface BookTrackerAchievementsGridProps {
  achievements: BookTrackerAchievement[];
  userAchievements: BookTrackerUserAchievement[];
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function BookTrackerAchievementsGrid({
  achievements,
  userAchievements,
}: BookTrackerAchievementsGridProps): React.JSX.Element {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const unlockedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const ua of userAchievements) {
      if (ua.achievement) ids.add(ua.achievement.id);
    }
    return ids;
  }, [userAchievements]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const a of achievements) {
      if (a.category) cats.add(a.category);
    }
    return ['all', ...Array.from(cats)];
  }, [achievements]);

  const filtered = useMemo(() => {
    if (categoryFilter === 'all') return achievements;
    return achievements.filter((a) => a.category === categoryFilter);
  }, [achievements, categoryFilter]);

  return (
    <div className="space-y-4" data-testid="achievements-grid">
      <div className="flex gap-2 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={(): void => { setCategoryFilter(cat); }}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              categoryFilter === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {cat === 'all' ? 'All' : cat}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((achievement) => {
          const userAchievement = userAchievements.find(
            (ua) => ua.achievement?.id === achievement.id,
          );
          return (
            <BookTrackerAchievementBadge
              key={achievement.id}
              achievement={achievement}
              unlocked={unlockedIds.has(achievement.id)}
              unlockedAt={userAchievement?.unlockedAt}
            />
          );
        })}
      </div>
      {filtered.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          No achievements in this category.
        </p>
      )}
    </div>
  );
}
