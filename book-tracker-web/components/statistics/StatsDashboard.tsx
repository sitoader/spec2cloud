'use client';

/**
 * Comprehensive reading statistics dashboard.
 */

import { useEffect, useState } from 'react';
import type {
  BookTrackerStatsOverview,
  BookTrackerMonthlyReading,
  BookTrackerGenreDistribution,
  BookTrackerAuthorReadCount,
} from '@/types';
import {
  bookTrackerGetStatsOverview,
  bookTrackerGetMonthlyReading,
  bookTrackerGetGenreDistribution,
  bookTrackerGetTopAuthors,
} from '@/lib/api/statistics';
import { BooksPerMonthChart } from './BooksPerMonthChart';
import { GenreDistributionChart } from './GenreDistributionChart';
import { TopAuthorsCard } from './TopAuthorsCard';

export function StatsDashboard(): React.JSX.Element {
  const [overview, setOverview] = useState<BookTrackerStatsOverview | null>(null);
  const [monthly, setMonthly] = useState<BookTrackerMonthlyReading[]>([]);
  const [genres, setGenres] = useState<BookTrackerGenreDistribution[]>([]);
  const [authors, setAuthors] = useState<BookTrackerAuthorReadCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [ov, mo, ge, au] = await Promise.all([
          bookTrackerGetStatsOverview(),
          bookTrackerGetMonthlyReading(year),
          bookTrackerGetGenreDistribution(),
          bookTrackerGetTopAuthors(),
        ]);
        setOverview(ov);
        setMonthly(mo);
        setGenres(ge);
        setAuthors(au);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    })();
  }, [year]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-zinc-200" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview stat cards */}
      {overview && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Total Books" value={overview.totalBooks} icon="📚" />
          <StatCard label="This Year" value={overview.booksThisYear} icon="📅" />
          <StatCard label="This Month" value={overview.booksThisMonth} icon="📖" />
          <StatCard
            label="Avg Rating"
            value={overview.averageRating.toFixed(1)}
            icon="⭐"
          />
          <StatCard
            label="Pages Read"
            value={overview.totalPagesRead.toLocaleString()}
            icon="📄"
          />
          <StatCard label="Streak" value={`${overview.currentStreak}d`} icon="🔥" />
        </div>
      )}

      {/* Year selector */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setYear((y) => y - 1)}
          className="rounded-md border border-zinc-300 px-2 py-1 text-sm hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-700"
        >
          ←
        </button>
        <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          {year}
        </span>
        <button
          type="button"
          onClick={() => setYear((y) => y + 1)}
          disabled={year >= new Date().getFullYear()}
          className="rounded-md border border-zinc-300 px-2 py-1 text-sm hover:bg-zinc-50 disabled:opacity-30 dark:border-zinc-600 dark:hover:bg-zinc-700"
        >
          →
        </button>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <h3 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Books per Month
          </h3>
          <BooksPerMonthChart data={monthly} />
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <h3 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Genre Distribution
          </h3>
          <GenreDistributionChart data={genres} />
        </div>
      </div>

      {/* Top Authors */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <h3 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Most-Read Authors
        </h3>
        <TopAuthorsCard data={authors} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: string;
}): React.JSX.Element {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {label}
        </span>
      </div>
      <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        {value}
      </p>
    </div>
  );
}
