'use client';

/**
 * BookTrackerSearchBar — debounced search input for external catalogue queries.
 *
 * Enforces a minimum character threshold before firing and
 * shows a spinner while a request is in flight.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface BookTrackerSearchBarProps {
  onSearchRequest: (phrase: string) => void;
  isBusy: boolean;
  debounceMs?: number;
  minChars?: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const DEBOUNCE_DEFAULT = 500;
const MIN_CHARS_DEFAULT = 3;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function BookTrackerSearchBar({
  onSearchRequest,
  isBusy,
  debounceMs = DEBOUNCE_DEFAULT,
  minChars = MIN_CHARS_DEFAULT,
}: BookTrackerSearchBarProps): React.JSX.Element {
  const [inputValue, setInputValue] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Cancel pending timer on unmount */
  useEffect(() => {
    return (): void => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const scheduleSearch = useCallback(
    (nextValue: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      const trimmed = nextValue.trim();
      if (trimmed.length < minChars) return;

      timerRef.current = setTimeout(() => {
        onSearchRequest(trimmed);
      }, debounceMs);
    },
    [onSearchRequest, debounceMs, minChars],
  );

  const handleTyping = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>): void => {
      const next = evt.target.value;
      setInputValue(next);
      scheduleSearch(next);
    },
    [scheduleSearch],
  );

  const clearInput = useCallback((): void => {
    setInputValue('');
    if (timerRef.current) clearTimeout(timerRef.current);
    onSearchRequest('');
  }, [onSearchRequest]);

  const meetsThreshold = inputValue.trim().length >= minChars;

  return (
    <div className="relative w-full" role="search" aria-label="Search external catalogues">
      {/* Magnifying-glass icon */}
      <span
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
        aria-hidden="true"
      >
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
        </svg>
      </span>

      <input
        type="text"
        value={inputValue}
        onChange={handleTyping}
        placeholder={`Type at least ${minChars} characters to search…`}
        aria-label="Search books"
        className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-10 pr-20 text-sm shadow-sm placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
      />

      {/* Right-side indicators */}
      <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
        {isBusy && meetsThreshold && (
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700 dark:border-zinc-600 dark:border-t-zinc-300"
            aria-label="Searching"
            role="status"
          />
        )}
        {inputValue.length > 0 && (
          <button
            type="button"
            onClick={clearInput}
            aria-label="Clear search"
            className="rounded p-0.5 text-zinc-400 transition-colors hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </span>
    </div>
  );
}
