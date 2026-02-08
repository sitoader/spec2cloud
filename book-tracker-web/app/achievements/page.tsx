'use client';

/**
 * BookTracker achievements page.
 *
 * Displays all available achievements and user's unlocked achievements.
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type { BookTrackerAchievement, BookTrackerUserAchievement } from '@/types';
import {
  bookTrackerGetAchievements,
  bookTrackerGetUserAchievements,
  bookTrackerGoalsReadableError,
} from '@/lib/api/goals';
import { BookTrackerAchievementsGrid } from '@/components/achievements/AchievementsGrid';
import { BookTrackerHeader } from '@/components/layout/Header';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AchievementsPage(): React.JSX.Element {
  const [achievements, setAchievements] = useState<BookTrackerAchievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<BookTrackerUserAchievement[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const [allAchievements, userUnlocked] = await Promise.all([
        bookTrackerGetAchievements(),
        bookTrackerGetUserAchievements(),
      ]);
      setAchievements(allAchievements);
      setUserAchievements(userUnlocked);
    } catch (caught) {
      setError(bookTrackerGoalsReadableError(caught));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return (
    <div className="min-h-screen bg-background">
      <BookTrackerHeader />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Achievements</h1>
          <Link href="/" className="text-sm text-primary hover:underline">
            ← Back
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}

        {!isLoading && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {userAchievements.length} / {achievements.length} achievements unlocked
            </p>
            <BookTrackerAchievementsGrid
              achievements={achievements}
              userAchievements={userAchievements}
            />
          </div>
        )}
      </main>
    </div>
  );
}
