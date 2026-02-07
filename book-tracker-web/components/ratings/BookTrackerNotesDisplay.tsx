'use client';

/**
 * BookTrackerNotesDisplay — display book notes with expand/edit toggle.
 */

import { useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Interface declarations                                             */
/* ------------------------------------------------------------------ */

interface BookTrackerNotesDisplayProps {
  /** The notes text to display. */
  notes: string;
  /** Callback when edit button is clicked. */
  onEdit?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TRUNCATE_LENGTH = 200;

/* ------------------------------------------------------------------ */
/*  Component implementation                                           */
/* ------------------------------------------------------------------ */

export default function BookTrackerNotesDisplay({
  notes,
  onEdit,
}: BookTrackerNotesDisplayProps): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);

  const isLong = notes.length > TRUNCATE_LENGTH;
  const displayText = isLong && !expanded ? `${notes.slice(0, TRUNCATE_LENGTH)}…` : notes;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Notes
        </h3>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            Edit
          </button>
        )}
      </div>
      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {displayText}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={(): void => setExpanded(!expanded)}
          className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
}
