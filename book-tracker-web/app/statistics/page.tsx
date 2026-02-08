'use client';

/**
 * BookTracker reading statistics page.
 *
 * Displays a comprehensive dashboard of reading statistics,
 * including overview metrics, books by month, genre distribution,
 * and most-read authors.
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type {
  BookTrackerStatisticsOverview,
  BookTrackerMonthlyCount,
  BookTrackerGenreCount,
  BookTrackerAuthorCount,
} from '@/types';
import {
  bookTrackerGetStatisticsOverview,
  bookTrackerGetBooksByMonth,
  bookTrackerGetGenreDistribution,
  bookTrackerGetMostReadAuthors,
  bookTrackerStatisticsReadableError,
} from '@/lib/api/statistics';
import { BookTrackerStatsDashboard } from '@/components/statistics/StatsDashboard';
import { BookTrackerHeader } from '@/components/layout/Header';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function StatisticsPage(): React.JSX.Element {
  const [overview, setOverview] = useState<BookTrackerStatisticsOverview | null>(null);
  const [monthlyData, setMonthlyData] = useState<BookTrackerMonthlyCount[]>([]);
  const [genres, setGenres] = useState<BookTrackerGenreCount[]>([]);
  const [authors, setAuthors] = useState<BookTrackerAuthorCount[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const [overviewData, monthly, genreData, authorData] = await Promise.all([
        bookTrackerGetStatisticsOverview(),
        bookTrackerGetBooksByMonth(),
        bookTrackerGetGenreDistribution(),
        bookTrackerGetMostReadAuthors(),
      ]);
      setOverview(overviewData);
      setMonthlyData(monthly);
      setGenres(genreData);
      setAuthors(authorData);
    } catch (caught) {
      setError(bookTrackerStatisticsReadableError(caught));
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
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Reading Statistics</h1>
          <Link
            href="/"
            className="text-sm text-primary hover:underline"
          >
            ← Back to Library
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

        {!isLoading && overview && (
          <div className="space-y-8">
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">Overview</h2>
              <BookTrackerStatsDashboard overview={overview} />
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                Books by Month ({new Date().getFullYear()})
              </h2>
              <div className="grid grid-cols-12 gap-1">
                {monthlyData.map((m) => (
                  <div key={m.month} className="text-center">
                    <div
                      className="mx-auto w-8 rounded bg-primary/80"
                      style={{
                        height: `${Math.max(4, m.count * 20)}px`,
                      }}
                    />
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {m.month}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <div className="grid gap-8 md:grid-cols-2">
              <section>
                <h2 className="mb-4 text-xl font-semibold text-foreground">
                  Genre Distribution
                </h2>
                {genres.length > 0 ? (
                  <div className="space-y-2">
                    {genres.slice(0, 10).map((g) => (
                      <div key={g.genre} className="flex items-center gap-2">
                        <span className="w-28 truncate text-sm text-foreground">
                          {g.genre}
                        </span>
                        <div className="flex-1">
                          <div
                            className="h-4 rounded bg-primary/60"
                            style={{
                              width: `${Math.max(5, (g.count / Math.max(...genres.map((x) => x.count))) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{g.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No genre data available.</p>
                )}
              </section>

              <section>
                <h2 className="mb-4 text-xl font-semibold text-foreground">
                  Most Read Authors
                </h2>
                {authors.length > 0 ? (
                  <div className="space-y-2">
                    {authors.map((a, i) => (
                      <div
                        key={a.author}
                        className="flex items-center justify-between rounded border border-border bg-card p-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {i + 1}
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            {a.author}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {a.count} book{a.count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No author data available.</p>
                )}
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
