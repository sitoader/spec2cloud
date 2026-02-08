'use client';

/**
 * BookTrackerAnnualGoalCard — displays annual reading goal progress.
 *
 * Shows a circular-style progress indicator with books read vs target.
 */

import type { BookTrackerReadingGoal } from '@/types';

/* ------------------------------------------------------------------ */
/*  Interface declarations                                             */
/* ------------------------------------------------------------------ */

interface BookTrackerAnnualGoalCardProps {
  goal: BookTrackerReadingGoal;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function BookTrackerAnnualGoalCard({
  goal,
}: BookTrackerAnnualGoalCardProps): React.JSX.Element {
  const percentage = goal.targetBooksCount > 0
    ? Math.min(100, Math.round((goal.completedBooksCount / goal.targetBooksCount) * 100))
    : 0;

  return (
    <div
      className="rounded-lg border border-border bg-card p-6 text-center"
      data-testid="annual-goal-card"
    >
      <h3 className="text-lg font-semibold text-foreground">
        {goal.year} Reading Goal
      </h3>
      <div className="my-4 flex items-center justify-center">
        <div className="relative h-24 w-24">
          <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-secondary"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${percentage * 2.51} 251`}
              className="text-primary transition-all duration-700 ease-out"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-foreground">{percentage}%</span>
          </div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{goal.completedBooksCount}</span>
        {' / '}
        {goal.targetBooksCount} books
      </p>
    </div>
  );
}
