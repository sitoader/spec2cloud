'use client';

/**
 * BookTrackerRatingForm — rating form with star input and notes textarea.
 *
 * Allows users to rate a book (1-5 stars) and add optional notes.
 */

import { useState, useCallback } from 'react';
import BookTrackerRatingStars from './BookTrackerRatingStars';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const MAX_NOTES_LENGTH = 1000;

/* ------------------------------------------------------------------ */
/*  Interface declarations                                             */
/* ------------------------------------------------------------------ */

interface BookTrackerRatingFormProps {
  /** Initial rating score (0 = unrated). */
  initialScore?: number;
  /** Initial notes text. */
  initialNotes?: string;
  /** Callback when the form is saved. */
  onSave: (score: number, notes?: string) => void | Promise<void>;
  /** Callback when the form is cancelled. */
  onCancel?: () => void;
  /** Whether the form is currently saving. */
  saving?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Component implementation                                           */
/* ------------------------------------------------------------------ */

export default function BookTrackerRatingForm({
  initialScore = 0,
  initialNotes = '',
  onSave,
  onCancel,
  saving = false,
}: BookTrackerRatingFormProps): React.JSX.Element {
  const [score, setScore] = useState(initialScore);
  const [notes, setNotes] = useState(initialNotes);
  const [error, setError] = useState('');

  const handleSave = useCallback((): void => {
    if (score < 1 || score > 5) {
      setError('Please select a rating between 1 and 5 stars.');
      return;
    }
    setError('');
    void onSave(score, notes || undefined);
  }, [score, notes, onSave]);

  const notesLength = notes.length;
  const nearLimit = notesLength > 900;
  const atLimit = notesLength >= MAX_NOTES_LENGTH;

  return (
    <div className="space-y-4">
      {/* Star rating */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Your Rating
        </label>
        <BookTrackerRatingStars value={score} onChange={setScore} />
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* Notes textarea */}
      <div>
        <label
          htmlFor="rating-notes"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Notes
        </label>
        <textarea
          id="rating-notes"
          value={notes}
          onChange={(e): void => setNotes(e.target.value.slice(0, MAX_NOTES_LENGTH))}
          placeholder="Add your thoughts about this book..."
          rows={4}
          maxLength={MAX_NOTES_LENGTH}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
        />
        <p
          className={`mt-1 text-xs ${
            atLimit
              ? 'text-red-600 dark:text-red-400'
              : nearLimit
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          {notesLength}/{MAX_NOTES_LENGTH} characters
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {saving ? 'Saving…' : 'Save Rating'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
