'use client';

/**
 * BookTrackerReadingSessionForm — form for logging a reading session.
 *
 * Provides inputs for start/end time, pages read, current page, and notes.
 */

import { useState } from 'react';
import type { BookTrackerLogSessionPayload } from '@/types';

/* ------------------------------------------------------------------ */
/*  Interface declarations                                             */
/* ------------------------------------------------------------------ */

interface BookTrackerReadingSessionFormProps {
  bookId: string;
  onSubmit: (payload: BookTrackerLogSessionPayload) => void;
  isLoading?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function BookTrackerReadingSessionForm({
  bookId,
  onSubmit,
  isLoading = false,
}: BookTrackerReadingSessionFormProps): React.JSX.Element {
  const [pagesRead, setPagesRead] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const now = new Date().toISOString();
    onSubmit({
      bookId,
      startTime: now,
      endTime: now,
      pagesRead: pagesRead ? parseInt(pagesRead, 10) : undefined,
      currentPage: currentPage ? parseInt(currentPage, 10) : undefined,
      notes: notes || undefined,
    });
    setPagesRead('');
    setCurrentPage('');
    setNotes('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      data-testid="reading-session-form"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="pagesRead"
            className="block text-sm font-medium text-foreground"
          >
            Pages Read
          </label>
          <input
            id="pagesRead"
            type="number"
            min="0"
            value={pagesRead}
            onChange={(e): void => { setPagesRead(e.target.value); }}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="e.g. 30"
          />
        </div>
        <div>
          <label
            htmlFor="currentPage"
            className="block text-sm font-medium text-foreground"
          >
            Current Page
          </label>
          <input
            id="currentPage"
            type="number"
            min="0"
            value={currentPage}
            onChange={(e): void => { setCurrentPage(e.target.value); }}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="e.g. 145"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="sessionNotes"
          className="block text-sm font-medium text-foreground"
        >
          Notes
        </label>
        <textarea
          id="sessionNotes"
          value={notes}
          onChange={(e): void => { setNotes(e.target.value); }}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          rows={2}
          placeholder="How was your reading session?"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {isLoading ? 'Logging…' : 'Log Session'}
      </button>
    </form>
  );
}
