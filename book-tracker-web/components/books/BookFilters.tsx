'use client';

/**
 * BookTrackerBookFilters — collection refinement controls.
 *
 * Provides interactive filtering mechanisms for status, rating,
 * genre, sort, and textual search across book collections.
 * Uses shadcn/ui primitives for a consistent, polished look.
 */

import { useCallback, type ChangeEvent } from 'react';
import { Search, X } from 'lucide-react';
import { BookTrackerBookStatus } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type SortField = 'addedDate' | 'title' | 'author' | 'rating';
export type RatingFilter = 'all' | 'rated' | 'unrated' | '1' | '2' | '3' | '4' | '5';

interface BookTrackerBookFiltersProps {
  activeStatusFilter: BookTrackerBookStatus | undefined;
  searchPhrase: string;
  ratingFilter: RatingFilter;
  genreFilter: string;
  sortField: SortField;
  sortAsc: boolean;
  availableGenres: string[];
  onStatusToggle: (status: BookTrackerBookStatus | undefined) => void;
  onSearchModify: (phrase: string) => void;
  onRatingChange: (rating: RatingFilter) => void;
  onGenreChange: (genre: string) => void;
  onSortFieldChange: (field: SortField) => void;
  onSortDirectionToggle: () => void;
}

/* ------------------------------------------------------------------ */
/*  Status configuration                                               */
/* ------------------------------------------------------------------ */

const STATUS_REGISTRY = [
  {
    value: BookTrackerBookStatus.ToRead,
    label: 'To Read',
    icon: '📘',
    activeClass: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-700',
    inactiveClass: 'bg-transparent text-zinc-600 border-zinc-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 dark:text-zinc-400 dark:border-zinc-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-300',
  },
  {
    value: BookTrackerBookStatus.Reading,
    label: 'Reading',
    icon: '📖',
    activeClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-700',
    inactiveClass: 'bg-transparent text-zinc-600 border-zinc-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 dark:text-zinc-400 dark:border-zinc-700 dark:hover:bg-amber-900/20 dark:hover:text-amber-300',
  },
  {
    value: BookTrackerBookStatus.Completed,
    label: 'Completed',
    icon: '✅',
    activeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-700',
    inactiveClass: 'bg-transparent text-zinc-600 border-zinc-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 dark:text-zinc-400 dark:border-zinc-700 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-300',
  },
];

const RATING_OPTIONS: { value: RatingFilter; label: string }[] = [
  { value: 'all', label: 'All Ratings' },
  { value: 'rated', label: 'Rated' },
  { value: '5', label: '★★★★★' },
  { value: '4', label: '★★★★ & up' },
  { value: '3', label: '★★★ & up' },
  { value: '2', label: '★★ & up' },
  { value: '1', label: '★ & up' },
  { value: 'unrated', label: 'Unrated' },
];

/** Combined sort options encoding field + direction in a single dropdown. */
const SORT_COMBINED: { value: string; label: string; field: SortField; asc: boolean }[] = [
  { value: 'addedDate-desc', label: 'Newest first',    field: 'addedDate', asc: false },
  { value: 'addedDate-asc',  label: 'Oldest first',    field: 'addedDate', asc: true },
  { value: 'title-asc',      label: 'Title A → Z',     field: 'title',     asc: true },
  { value: 'title-desc',     label: 'Title Z → A',     field: 'title',     asc: false },
  { value: 'author-asc',     label: 'Author A → Z',    field: 'author',    asc: true },
  { value: 'author-desc',    label: 'Author Z → A',    field: 'author',    asc: false },
  { value: 'rating-desc',    label: 'Highest rated',    field: 'rating',    asc: false },
  { value: 'rating-asc',     label: 'Lowest rated',     field: 'rating',    asc: true },
];

/* ------------------------------------------------------------------ */
/*  Component implementation                                           */
/* ------------------------------------------------------------------ */

export function BookTrackerBookFilters({
  activeStatusFilter,
  searchPhrase,
  ratingFilter,
  genreFilter,
  sortField,
  sortAsc,
  availableGenres,
  onStatusToggle,
  onSearchModify,
  onRatingChange,
  onGenreChange,
  onSortFieldChange,
  onSortDirectionToggle,
}: BookTrackerBookFiltersProps): React.JSX.Element {
  const handleSearchInput = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => {
      onSearchModify(evt.target.value);
    },
    [onSearchModify],
  );

  const handleStatusClick = useCallback(
    (status: BookTrackerBookStatus) => {
      const newStatus = activeStatusFilter === status ? undefined : status;
      onStatusToggle(newStatus);
    },
    [activeStatusFilter, onStatusToggle],
  );

  const handleClearFilters = useCallback(() => {
    onStatusToggle(undefined);
    onSearchModify('');
    onRatingChange('all');
    onGenreChange('');
    onSortFieldChange('addedDate');
  }, [onStatusToggle, onSearchModify, onRatingChange, onGenreChange, onSortFieldChange]);

  const handleSortCombinedChange = useCallback(
    (combined: string) => {
      const option = SORT_COMBINED.find((o) => o.value === combined);
      if (!option) return;
      // Update field if it changed
      if (option.field !== sortField) {
        onSortFieldChange(option.field);
      }
      // Update direction if it changed
      if (option.asc !== sortAsc) {
        onSortDirectionToggle();
      }
    },
    [sortField, sortAsc, onSortFieldChange, onSortDirectionToggle],
  );

  const hasActiveFilters =
    activeStatusFilter !== undefined ||
    searchPhrase.length > 0 ||
    ratingFilter !== 'all' ||
    genreFilter !== '';

  const activeFilterCount = [
    activeStatusFilter !== undefined,
    searchPhrase.length > 0,
    ratingFilter !== 'all',
    genreFilter !== '',
  ].filter(Boolean).length;

  const combinedSortValue = `${sortField}-${sortAsc ? 'asc' : 'desc'}`;

  return (
    <div className="space-y-3 rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {/* Row 1: Search + filter dropdowns — all inline */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            id="bt-search-books"
            type="text"
            placeholder="Search by title or author…"
            value={searchPhrase}
            onChange={handleSearchInput}
            className="h-9 pl-9 text-sm"
          />
        </div>

        {/* Rating */}
        <Select value={ratingFilter} onValueChange={(v) => onRatingChange(v as RatingFilter)}>
          <SelectTrigger className="h-9 w-full sm:w-[130px]" size="sm">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            {RATING_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Genre */}
        {availableGenres.length > 0 && (
          <Select value={genreFilter || '__all__'} onValueChange={(v) => onGenreChange(v === '__all__' ? '' : v)}>
            <SelectTrigger className="h-9 w-full sm:w-[130px]" size="sm">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Genres</SelectItem>
              {availableGenres.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Sort — single dropdown combining field + direction */}
        <Select value={combinedSortValue} onValueChange={handleSortCombinedChange}>
          <SelectTrigger className="h-9 w-full sm:w-[150px]" size="sm">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_COMBINED.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Row 2: Clear filters */}
      {hasActiveFilters && (
        <div className="flex items-center">
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-7 gap-1 rounded-full px-2.5 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <X className="size-3" />
            Clear
            <Badge variant="secondary" className="ml-0.5 h-4 min-w-4 rounded-full px-1 text-[10px] leading-none">
              {activeFilterCount}
            </Badge>
          </Button>
        </div>
      )}
    </div>
  );
}
