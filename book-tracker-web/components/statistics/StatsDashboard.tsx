'use client';

/**
 * BookTrackerStatsDashboard — main statistics overview dashboard.
 *
 * Displays key reading statistics in a card grid layout.
 */

import type { BookTrackerStatisticsOverview } from '@/types';

/* ------------------------------------------------------------------ */
/*  Interface declarations                                             */
/* ------------------------------------------------------------------ */

interface BookTrackerStatsDashboardProps {
  overview: BookTrackerStatisticsOverview;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function BookTrackerStatsDashboard({
  overview,
}: BookTrackerStatsDashboardProps): React.JSX.Element {
  const stats = [
    { label: 'Total Books', value: overview.totalBooks, icon: '📚' },
    { label: 'This Year', value: overview.booksThisYear, icon: '📅' },
    { label: 'This Month', value: overview.booksThisMonth, icon: '📆' },
    { label: 'Avg Rating', value: overview.averageRating.toFixed(1), icon: '⭐' },
    { label: 'Pages Read', value: overview.totalPagesRead.toLocaleString(), icon: '📄' },
    { label: 'Current Streak', value: `${overview.currentStreak} days`, icon: '🔥' },
  ];

  return (
    <div
      className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6"
      data-testid="stats-dashboard"
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-border bg-card p-4 text-center"
        >
          <div className="text-2xl">{stat.icon}</div>
          <div className="mt-1 text-xl font-bold text-foreground">{stat.value}</div>
          <div className="text-xs text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
