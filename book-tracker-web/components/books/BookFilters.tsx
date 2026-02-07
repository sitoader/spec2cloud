'use client';

/**
 * BookTrackerBookFilters — collection refinement controls.
 *
 * Provides interactive filtering mechanisms for status-based
 * segregation and textual search across book collections.
 */

import { useCallback, type ChangeEvent } from 'react';
import { BookTrackerBookStatus } from '@/types';

/* ------------------------------------------------------------------ */
/*  Interface declarations                                             */
/* ------------------------------------------------------------------ */

interface BookTrackerBookFiltersProps {
  activeStatusFilter: BookTrackerBookStatus | undefined;
  searchPhrase: string;
  onStatusToggle: (status: BookTrackerBookStatus | undefined) => void;
  onSearchModify: (phrase: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Status configuration                                               */
/* ------------------------------------------------------------------ */

const STATUS_REGISTRY = [
  { value: BookTrackerBookStatus.ToRead, label: 'To Read', colorClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' },
  { value: BookTrackerBookStatus.Reading, label: 'Reading', colorClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200' },
  { value: BookTrackerBookStatus.Completed, label: 'Completed', colorClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200' },
];

/* ------------------------------------------------------------------ */
/*  Component implementation                                           */
/* ------------------------------------------------------------------ */

export function BookTrackerBookFilters({
  activeStatusFilter,
  searchPhrase,
  onStatusToggle,
  onSearchModify,
}: BookTrackerBookFiltersProps): React.JSX.Element {
  const handleSearchInput = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => {
      onSearchModify(evt.target.value);
    },
    [onSearchModify]
  );

  const handleStatusClick = useCallback(
    (status: BookTrackerBookStatus) => {
      const newStatus = activeStatusFilter === status ? undefined : status;
      onStatusToggle(newStatus);
    },
    [activeStatusFilter, onStatusToggle]
  );

  const handleClearFilters = useCallback(() => {
    onStatusToggle(undefined);
    onSearchModify('');
  }, [onStatusToggle, onSearchModify]);

  const hasActiveFilters = activeStatusFilter !== undefined || searchPhrase.length > 0;

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Search input */}
      <div>
        <label htmlFor="bt-search-books" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Search books
        </label>
        <input
          id="bt-search-books"
          type="text"
          placeholder="Search by title or author..."
          value={searchPhrase}
          onChange={handleSearchInput}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          aria-label="Search books by title or author"
        />
      </div>

      {/* Status filters */}
      <div>
        <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Filter by status
        </p>
        <div className="flex flex-wrap gap-2">
          {STATUS_REGISTRY.map((statusConfig) => {
            const isActive = activeStatusFilter === statusConfig.value;
            const buttonClasses = isActive
              ? `${statusConfig.colorClass} border-2 border-zinc-900 dark:border-zinc-100`
              : `${statusConfig.colorClass} border-2 border-transparent`;

            return (
              <button
                key={statusConfig.value}
                type="button"
                onClick={() => handleStatusClick(statusConfig.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${buttonClasses}`}
                aria-pressed={isActive}
                aria-label={`Filter by ${statusConfig.label}`}
              >
                {statusConfig.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleClearFilters}
          className="self-start rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          aria-label="Clear all filters"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
