'use client';

/**
 * Small badge showing series info on a book card.
 */

interface SeriesBadgeProps {
  seriesName: string;
  position: number;
  totalBooks?: number;
}

export function SeriesBadge({
  seriesName,
  position,
  totalBooks,
}: SeriesBadgeProps): React.JSX.Element {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400">
      📖 {seriesName} #{position}
      {totalBooks && <span className="text-indigo-400 dark:text-indigo-500">/{totalBooks}</span>}
    </span>
  );
}
