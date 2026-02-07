'use client';

/**
 * BookTrackerRatingStars — interactive star rating component.
 *
 * Supports click-to-rate and hover-preview modes, as well as
 * a display-only mode for showing existing ratings.
 */

import { useState, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/*  Interface declarations                                             */
/* ------------------------------------------------------------------ */

interface BookTrackerRatingStarsProps {
  /** Current rating value (0 = no rating). */
  value: number;
  /** Callback when a star is clicked. Omit for display-only mode. */
  onChange?: (score: number) => void;
  /** If true, stars are not interactive. */
  readOnly?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Component implementation                                           */
/* ------------------------------------------------------------------ */

export default function BookTrackerRatingStars({
  value,
  onChange,
  readOnly = false,
}: BookTrackerRatingStarsProps): React.JSX.Element {
  const [hoverValue, setHoverValue] = useState(0);

  const handleClick = useCallback(
    (star: number): void => {
      if (!readOnly && onChange) {
        onChange(star);
      }
    },
    [readOnly, onChange],
  );

  const handleMouseEnter = useCallback(
    (star: number): void => {
      if (!readOnly) {
        setHoverValue(star);
      }
    },
    [readOnly],
  );

  const handleMouseLeave = useCallback((): void => {
    setHoverValue(0);
  }, []);

  const displayValue = hoverValue || value;
  const interactive = !readOnly && !!onChange;

  return (
    <div
      className="inline-flex gap-0.5"
      role="radiogroup"
      aria-label="Rating"
      onMouseLeave={handleMouseLeave}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const star = i + 1;
        const filled = star <= displayValue;

        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === value}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
            disabled={!interactive}
            onClick={(): void => handleClick(star)}
            onMouseEnter={(): void => handleMouseEnter(star)}
            className={`text-xl transition-colors ${
              interactive
                ? 'cursor-pointer hover:scale-110'
                : 'cursor-default'
            } ${
              filled
                ? 'text-amber-400'
                : 'text-zinc-300 dark:text-zinc-600'
            } disabled:cursor-default`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
