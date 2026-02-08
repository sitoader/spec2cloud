'use client';

/**
 * Log reading session form with quick-action duration buttons.
 */

import { useState, useCallback } from 'react';
import type { BookTrackerLogSessionPayload, BookTrackerReadingSession } from '@/types';
import { bookTrackerLogSession } from '@/lib/api/progress';

interface ReadingSessionFormProps {
  bookId: string;
  onSessionLogged?: (session: BookTrackerReadingSession) => void;
  onCancel?: () => void;
}

const QUICK_DURATIONS = [
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
  { label: '1 hr', minutes: 60 },
  { label: '2 hrs', minutes: 120 },
];

export function ReadingSessionForm({
  bookId,
  onSessionLogged,
  onCancel,
}: ReadingSessionFormProps): React.JSX.Element {
  const [pagesRead, setPagesRead] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const logQuickSession = useCallback(
    async (minutes: number) => {
      setSaving(true);
      setSuccess(false);
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - minutes * 60 * 1000);

      const payload: BookTrackerLogSessionPayload = {
        bookId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        pagesRead: pagesRead || undefined,
        currentPage: currentPage || undefined,
        notes: notes || undefined,
      };

      try {
        const session = await bookTrackerLogSession(payload);
        onSessionLogged?.(session);
        setSuccess(true);
        setPagesRead(0);
        setNotes('');
        setTimeout(() => setSuccess(false), 2000);
      } catch {
        // silent
      } finally {
        setSaving(false);
      }
    },
    [bookId, pagesRead, currentPage, notes, onSessionLogged],
  );

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        Log Reading Session
      </h3>

      {/* Quick session buttons */}
      <div className="flex flex-wrap gap-2">
        {QUICK_DURATIONS.map((d) => (
          <button
            key={d.minutes}
            type="button"
            onClick={() => logQuickSession(d.minutes)}
            disabled={saving}
            className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-emerald-600 dark:hover:bg-emerald-950 dark:hover:text-emerald-400"
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Optional details */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">
            Pages read
          </label>
          <input
            type="number"
            min={0}
            value={pagesRead || ''}
            onChange={(e) => setPagesRead(Number(e.target.value))}
            placeholder="0"
            className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">
            Current page
          </label>
          <input
            type="number"
            min={0}
            value={currentPage || ''}
            onChange={(e) => setCurrentPage(Number(e.target.value))}
            placeholder="0"
            className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
          />
        </div>
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Session notes (optional)"
        rows={2}
        className="w-full resize-none rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
      />

      <div className="flex items-center gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
          >
            Cancel
          </button>
        )}
        {success && (
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            Session logged successfully!
          </p>
        )}
      </div>
    </div>
  );
}
