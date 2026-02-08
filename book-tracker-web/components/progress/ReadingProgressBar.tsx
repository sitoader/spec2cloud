'use client';

/**
 * Visual reading progress bar with percentage and page count.
 */

import { useState, useCallback } from 'react';
import type { BookTrackerReadingProgress } from '@/types';
import { bookTrackerUpdateProgress } from '@/lib/api/progress';

interface ReadingProgressBarProps {
  bookId: string;
  progress: BookTrackerReadingProgress | null;
  onUpdate?: (progress: BookTrackerReadingProgress) => void;
}

export function ReadingProgressBar({
  bookId,
  progress,
  onUpdate,
}: ReadingProgressBarProps): React.JSX.Element {
  const [editing, setEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(progress?.currentPage ?? 0);
  const [totalPages, setTotalPages] = useState(progress?.totalPages ?? 0);
  const [saving, setSaving] = useState(false);

  const percentage = progress?.progressPercentage ?? 0;

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const updated = await bookTrackerUpdateProgress(bookId, {
        currentPage,
        totalPages: totalPages || undefined,
      });
      onUpdate?.(updated);
      setEditing(false);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }, [bookId, currentPage, totalPages, onUpdate]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Reading Progress
        </span>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Update
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500 ease-out"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span>
          {progress ? `Page ${progress.currentPage}` : 'Not started'}
          {progress?.totalPages ? ` of ${progress.totalPages}` : ''}
        </span>
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          {percentage.toFixed(0)}%
        </span>
      </div>

      {/* Estimated completion */}
      {progress?.estimatedCompletionDate && (
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          Est. completion:{' '}
          {new Date(progress.estimatedCompletionDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </p>
      )}

      {/* Edit form */}
      {editing && (
        <div className="mt-2 space-y-2 rounded-md border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Current Page
              </label>
              <input
                type="number"
                min={0}
                value={currentPage}
                onChange={(e) => setCurrentPage(Number(e.target.value))}
                className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Total Pages
              </label>
              <input
                type="number"
                min={0}
                value={totalPages}
                onChange={(e) => setTotalPages(Number(e.target.value))}
                className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-md px-3 py-1 text-xs font-medium text-zinc-600 hover:text-zinc-800 dark:text-zinc-400"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
