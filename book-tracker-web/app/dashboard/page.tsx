'use client';

/**
 * Dashboard — unified reading activity hub.
 *
 * Combines Statistics, Achievements, Reading Goals, and Followed Authors
 * into a single tabbed view for a streamlined experience.
 */

import { useEffect, useState, useCallback } from 'react';
import { BookTrackerHeader } from '@/components/layout/Header';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

/* Statistics components */
import { StatsDashboard } from '@/components/statistics/StatsDashboard';
import { ReadingStreakBadge } from '@/components/progress/ReadingStreakBadge';
import { AnnualGoalCard } from '@/components/goals/AnnualGoalCard';

/* Achievements components */
import { AchievementsGrid } from '@/components/achievements/AchievementsGrid';

/* Authors components */
import { FollowedAuthorsList } from '@/components/authors/FollowedAuthorsList';

/* Series components */
import { SeriesProgressCard } from '@/components/series/SeriesProgressCard';

import type { BookTrackerReadingStreak, BookTrackerBookSeries } from '@/types';
import { bookTrackerGetStreak } from '@/lib/api/progress';
import { bookTrackerListSeries } from '@/lib/api/series';

export default function DashboardPage(): React.JSX.Element {
  const [streak, setStreak] = useState<BookTrackerReadingStreak | null>(null);
  const [seriesList, setSeriesList] = useState<BookTrackerBookSeries[]>([]);
  const [seriesLoading, setSeriesLoading] = useState(true);

  const loadStreak = useCallback(async () => {
    try {
      const data = await bookTrackerGetStreak();
      setStreak(data);
    } catch {
      // no streak data
    }
  }, []);

  const loadSeries = useCallback(async () => {
    setSeriesLoading(true);
    try {
      const data = await bookTrackerListSeries();
      setSeriesList(data);
    } catch {
      // silent
    } finally {
      setSeriesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStreak();
    void loadSeries();
  }, [loadStreak, loadSeries]);

  return (
    <>
      <BookTrackerHeader />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Your reading activity at a glance
          </p>
        </div>

        {/* Top row: Streak + Goal — always visible */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <ReadingStreakBadge streak={streak} />
          <AnnualGoalCard />
        </div>

        {/* Tabbed content */}
        <Tabs defaultValue="statistics" className="space-y-6">
          <TabsList>
            <TabsTrigger value="statistics">
              <span className="mr-1.5">📊</span> Statistics
            </TabsTrigger>
            <TabsTrigger value="achievements">
              <span className="mr-1.5">🏆</span> Achievements
            </TabsTrigger>
            <TabsTrigger value="series">
              <span className="mr-1.5">📖</span> Series
            </TabsTrigger>
            <TabsTrigger value="authors">
              <span className="mr-1.5">✍️</span> Authors
            </TabsTrigger>
          </TabsList>

          {/* --- Statistics Tab --- */}
          <TabsContent value="statistics">
            <StatsDashboard />
          </TabsContent>

          {/* --- Achievements Tab --- */}
          <TabsContent value="achievements">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
              <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                All Achievements
              </h2>
              <AchievementsGrid />
            </div>
          </TabsContent>

          {/* --- Series Tab --- */}
          <TabsContent value="series">
            {seriesLoading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-3 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-zinc-200" />
              </div>
            ) : seriesList.length === 0 ? (
              <div className="py-16 text-center">
                <span className="text-5xl">📖</span>
                <h2 className="mt-4 text-lg font-semibold text-zinc-700 dark:text-zinc-300">
                  No series tracked
                </h2>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  Series will appear here once books are linked to a series
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {seriesList.map((series) => (
                  <SeriesProgressCard key={series.id} series={series} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* --- Authors Tab --- */}
          <TabsContent value="authors">
            <div className="mx-auto max-w-3xl">
              <FollowedAuthorsList />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
