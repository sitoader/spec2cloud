'use client';

/**
 * Annual reading goal card with circular progress visualization.
 */

import { useState, useCallback, useEffect } from 'react';
import type { BookTrackerReadingGoal } from '@/types';
import { bookTrackerGetGoal, bookTrackerCreateGoal, bookTrackerUpdateGoal } from '@/lib/api/goals';

interface AnnualGoalCardProps {
  year?: number;
}

export function AnnualGoalCard({ year }: AnnualGoalCardProps): React.JSX.Element {
  const currentYear = year ?? new Date().getFullYear();
  const [goal, setGoal] = useState<BookTrackerReadingGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [targetInput, setTargetInput] = useState(12);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await bookTrackerGetGoal(currentYear);
        setGoal(data);
        setTargetInput(data.targetBooksCount);
      } catch {
        // No goal set yet
      } finally {
        setLoading(false);
      }
    })();
  }, [currentYear]);

  const handleSave = useCallback(async () => {
    try {
      if (goal) {
        const updated = await bookTrackerUpdateGoal(currentYear, { targetBooksCount: targetInput });
        setGoal(updated);
      } else {
        const created = await bookTrackerCreateGoal({ year: currentYear, targetBooksCount: targetInput });
        setGoal(created);
      }
      setEditing(false);
    } catch {
      // silent
    }
  }, [goal, currentYear, targetInput]);

  const completed = goal?.completedBooksCount ?? 0;
  const target = goal?.targetBooksCount ?? 0;
  const percentage = target > 0 ? Math.min((completed / target) * 100, 100) : 0;

  // SVG circular progress
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-zinc-200" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          {currentYear} Reading Goal
        </h3>
        <button
          type="button"
          onClick={() => setEditing(!editing)}
          className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
        >
          {editing ? 'Cancel' : goal ? 'Edit' : 'Set Goal'}
        </button>
      </div>

      {editing ? (
        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">
              Books to read in {currentYear}
            </label>
            <input
              type="number"
              min={1}
              value={targetInput}
              onChange={(e) => setTargetInput(Number(e.target.value))}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
            />
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Save Goal
          </button>
        </div>
      ) : goal ? (
        <div className="mt-4 flex flex-col items-center">
          {/* Circular progress */}
          <div className="relative">
            <svg width="128" height="128" className="-rotate-90">
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke="currentColor"
                className="text-zinc-200 dark:text-zinc-700"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke="currentColor"
                className="text-emerald-500 transition-all duration-700 ease-out"
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {completed}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                of {target}
              </span>
            </div>
          </div>
          <p className="mt-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {percentage >= 100
              ? '🎉 Goal Complete!'
              : `${target - completed} books to go`}
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col items-center text-center">
          <span className="text-4xl">🎯</span>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Set a reading goal for {currentYear}
          </p>
        </div>
      )}
    </div>
  );
}
