'use client';

/**
 * Visual badge for book reading status.
 */

import { cn } from '@/lib/utils/cn';
import type { BookTrackerBookStatus } from '@/types';

const STATUS_STYLES: Record<BookTrackerBookStatus, string> = {
  ToRead: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  Reading: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  Completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
};

const STATUS_LABELS: Record<BookTrackerBookStatus, string> = {
  ToRead: 'To Read',
  Reading: 'Reading',
  Completed: 'Completed',
};

interface BookTrackerStatusBadgeProps {
  status: BookTrackerBookStatus;
  className?: string;
}

export default function BookTrackerStatusBadge({
  status,
  className,
}: BookTrackerStatusBadgeProps): React.JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        STATUS_STYLES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
