'use client';

/**
 * Grid of all achievements with category filter, progress overview,
 * and explanatory UI so users understand how the system works.
 */

import { useEffect, useState } from 'react';
import type { BookTrackerAchievement, BookTrackerUserAchievement } from '@/types';
import { bookTrackerListAchievements, bookTrackerListUserAchievements } from '@/lib/api/achievements';
import { AchievementBadge } from './AchievementBadge';

/* ── Category metadata ─────────────────────────────────────────── */

interface CategoryMeta {
  key: string;
  label: string;
  icon: string;
  description: string;
}

const CATEGORIES: CategoryMeta[] = [
  {
    key: 'all',
    label: 'All',
    icon: '🎯',
    description: 'Every achievement you can earn',
  },
  {
    key: 'milestone',
    label: 'Milestones',
    icon: '🏆',
    description: 'Awarded when you reach book-count milestones (e.g. 5, 10, 25, 50 books read)',
  },
  {
    key: 'genre',
    label: 'Genre Explorer',
    icon: '📚',
    description: 'Earned by reading across different genres — broaden your horizons!',
  },
  {
    key: 'rating',
    label: 'Ratings',
    icon: '⭐',
    description: 'Earned by rating and reviewing the books you read',
  },
  {
    key: 'streak',
    label: 'Streaks',
    icon: '🔥',
    description: 'Keep a consistent reading habit to earn these badges',
  },
  {
    key: 'speed',
    label: 'Speed Reader',
    icon: '⚡',
    description: 'Finish books within a short time-frame to unlock these',
  },
];

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

  const activeCat = CATEGORIES.find((c) => c.key === filter) ?? CATEGORIES[0];

  /* ── Progress per-category ─────────────────────────────────── */
  const categoryProgress = CATEGORIES.filter((c) => c.key !== 'all').map((c) => {
    const total = achievements.filter((a) => a.category === c.key).length;
    const unlocked = achievements.filter(
      (a) => a.category === c.key && earnedMap.has(a.id),
    ).length;
    return { ...c, total, unlocked };
  });

  const totalUnlocked = earned.length;
  const totalCount = achievements.length;
  const pct = totalCount > 0 ? Math.round((totalUnlocked / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-zinc-200" />
      </div>
    );
  }

  /* ── Empty state (no achievements defined yet) ─────────────── */
  if (totalCount === 0) {
    return (
      <div className="space-y-6">
        <HowItWorks />
        <div className="py-12 text-center">
          <span className="text-5xl">🏆</span>
          <h3 className="mt-4 text-lg font-semibold text-zinc-700 dark:text-zinc-300">
            No achievements available yet
          </h3>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Achievements will appear here as they are added to the system.
            <br />
            Start reading and tracking your books — your progress will count!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── How It Works banner ────────────────────────────────── */}
      <HowItWorks />

      {/* ── Overall progress ──────────────────────────────────── */}
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/60">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            Overall progress
          </span>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {totalUnlocked} of {totalCount} unlocked ({pct}%)
          </span>
        </div>
        {/* full bar */}
        <div className="mb-4 h-2.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        {/* per-category mini-bars */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categoryProgress.map((cp) => {
            const cpPct = cp.total > 0 ? Math.round((cp.unlocked / cp.total) * 100) : 0;
            return (
              <button
                key={cp.key}
                type="button"
                onClick={() => setFilter(cp.key)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                  filter === cp.key
                    ? 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20'
                    : 'border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700/60'
                }`}
              >
                <span className="text-base">{cp.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                      {cp.label}
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {cp.unlocked}/{cp.total}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-600">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all duration-500"
                      style={{ width: `${cpPct}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Active category description ───────────────────────── */}
      <div className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">
        <span className="text-xl">{activeCat.icon}</span>
        <div>
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            {activeCat.label}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {activeCat.description}
          </p>
        </div>
      </div>

      {/* ── Category filter pills ─────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const count =
            cat.key === 'all'
              ? totalCount
              : achievements.filter((a) => a.category === cat.key).length;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setFilter(cat.key)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filter === cat.key
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
              <span
                className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                  filter === cat.key
                    ? 'bg-white/20 text-white dark:bg-zinc-900/30 dark:text-zinc-200'
                    : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Achievements grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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

/* ── "How it works" collapsible explainer ────────────────────── */

function HowItWorks(): React.JSX.Element {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800/50 dark:bg-blue-950/20">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">💡</span>
          <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">
            How do achievements work?
          </span>
        </div>
        <span
          className={`text-blue-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          ▾
        </span>
      </button>
      {open && (
        <div className="border-t border-blue-200 px-4 py-3 dark:border-blue-800/50">
          <div className="grid gap-3 text-xs text-blue-900 dark:text-blue-200 sm:grid-cols-2">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-base">🏆</span>
              <div>
                <p className="font-semibold">Milestones</p>
                <p className="text-blue-700 dark:text-blue-400">
                  Earned automatically as you reach reading milestones — read 5, 10, 25, or 50 books to unlock these.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-base">📚</span>
              <div>
                <p className="font-semibold">Genre Explorer</p>
                <p className="text-blue-700 dark:text-blue-400">
                  Read books across different genres. The more diverse your library, the more you unlock.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-base">⚡</span>
              <div>
                <p className="font-semibold">Speed Reader</p>
                <p className="text-blue-700 dark:text-blue-400">
                  Finish books quickly! These badges reward fast reading sessions and finishing books in record time.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-base">🔥</span>
              <div>
                <p className="font-semibold">Streaks</p>
                <p className="text-blue-700 dark:text-blue-400">
                  Log reading activity every day. Maintain a streak of 3, 7, 14, or 30+ days to earn these.
                </p>
              </div>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-blue-600 dark:text-blue-400">
            💡 Achievements are tracked automatically. Keep reading and logging progress — your badges will appear here as soon as you qualify!
          </p>
        </div>
      )}
    </div>
  );
}
