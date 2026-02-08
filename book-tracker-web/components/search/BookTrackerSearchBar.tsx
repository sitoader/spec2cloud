'use client';

/**
 * BookTrackerSearchBar — debounced search input for external catalogue queries.
 *
 * Enforces a minimum character threshold before firing and
 * shows a spinner while a request is in flight.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
      
      <Input
        type="text"
        value={inputValue}
        onChange={handleTyping}
        placeholder={`Type at least ${minChars} characters to search…`}
        aria-label="Search books"
        className="pl-10 pr-20"
      />

      {/* Right-side indicators */}
      <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
        {isBusy && meetsThreshold && (
          <Loader2 
            className="h-4 w-4 animate-spin text-zinc-500" 
            aria-label="Searching"
            role="status"
          />
        )}
        {inputValue.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clearInput}
            aria-label="Clear search"
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
