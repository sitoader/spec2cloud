/**
 * BookTrackerStatusBadge — displays reading progress indicator.
 *
 * Renders a small pill badge showing the current status of a book
 * (To Read, Reading, or Completed) with color-coded visual styling.
 */

import type { BookTrackerBookStatus } from '@/types';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface BookTrackerStatusBadgeProps {
  status: BookTrackerBookStatus;
}

/* ------------------------------------------------------------------ */
/*  Helper                                                             */
/* ------------------------------------------------------------------ */

function deriveStatusLabel(code: BookTrackerBookStatus): string {
  if (code === 0) return 'To Read';
  if (code === 1) return 'Reading';
  if (code === 2) return 'Completed';
  return 'Unknown';
}

function deriveStatusColorClasses(code: BookTrackerBookStatus): string {
  // ToRead = 0
  if (code === 0) {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
  }
  // Reading = 1
  if (code === 1) {
    return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200';
  }
  // Completed = 2
  if (code === 2) {
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200';
  }
  return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200';
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function BookTrackerStatusBadge({
  status,
}: BookTrackerStatusBadgeProps): React.JSX.Element {
  const displayText = deriveStatusLabel(status);
  const colorClasses = deriveStatusColorClasses(status);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClasses}`}
      role="status"
      aria-label={`Reading status: ${displayText}`}
    >
      {displayText}
    </span>
  );
}
