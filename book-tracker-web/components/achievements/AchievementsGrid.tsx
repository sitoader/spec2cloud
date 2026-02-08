'use client';

/**
 * Grid of all achievements with category filter.
 */

import { useEffect, useState } from 'react';
import type { BookTrackerAchievement, BookTrackerUserAchievement } from '@/types';
import { bookTrackerListAchievements, bookTrackerListUserAchievements } from '@/lib/api/achievements';
import { AchievementBadge } from './AchievementBadge';

const CATEGORY_FILTERS = ['all', 'milestone', 'genre', 'speed', 'streak'];

export function AchievementsGrid(): React.JSX.Element {
  const [achievements, setAchievements] = useState<BookTrackerAchievement[]>([]);
  const [earned, setEarned] = useState<BookTrackerUserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [allAch, userAch] = await Promise.all([
          bookTrackerListAchievements(),
          bookTrackerListUserAchievements(),
        ]);
        setAchievements(allAch);
        setEarned(userAch);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered =
    filter === 'all'
      ? achievements
      : achievements.filter((a) => a.category === filter);

  const earnedMap = new Map(earned.map((e) => [e.achievementId, e]));

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-zinc-200" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats summary */}
      <div className="flex items-center gap-4">
        <div className="rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
          {earned.length} / {achievements.length} unlocked
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {CATEGORY_FILTERS.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
              filter === cat
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Achievements grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filtered.map((ach) => (
          <AchievementBadge
            key={ach.id}
            achievement={ach}
            earned={earnedMap.get(ach.id)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          No achievements in this category yet.
        </p>
      )}
    </div>
  );
}
