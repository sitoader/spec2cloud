'use client';

/**
 * Filter controls for the book library.
 */

import { useCallback } from 'react';
import { BookTrackerBookStatus } from '@/types';

const STATUS_OPTIONS: { value: BookTrackerBookStatus | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: BookTrackerBookStatus.Completed, label: 'Read' },
  { value: BookTrackerBookStatus.ToRead, label: 'TBR' },
  { value: BookTrackerBookStatus.Reading, label: 'Reading' },
];

interface BookTrackerBookFiltersProps {
  statusFilter: BookTrackerBookStatus | '';
  searchQuery: string;
  onStatusChange: (status: BookTrackerBookStatus | '') => void;
  onSearchChange: (query: string) => void;
}

export default function BookTrackerBookFilters({
  statusFilter,
  searchQuery,
  onStatusChange,
  onSearchChange,
}: BookTrackerBookFiltersProps): React.JSX.Element {
  const handleClear = useCallback((): void => {
    onStatusChange('');
    onSearchChange('');
  }, [onStatusChange, onSearchChange]);

  const hasFilters = statusFilter !== '' || searchQuery !== '';

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Status tabs */}
      <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800" role="tablist" aria-label="Filter by status">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={statusFilter === opt.value}
            onClick={(): void => onStatusChange(opt.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === opt.value
                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Search and clear */}
      <div className="flex gap-2">
        <input
          type="search"
          placeholder="Search by title or author…"
          value={searchQuery}
          onChange={(e): void => onSearchChange(e.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 sm:w-64"
          aria-label="Search books"
        />
        {hasFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-700"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
