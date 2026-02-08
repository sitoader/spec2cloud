'use client';

/**
 * BookTrackerRatingStars — interactive star rating component.
 *
 * Supports click-to-rate and hover-preview modes, as well as
 * a display-only mode for showing existing ratings.
 */

import { useState, useCallback } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
  /** Size variant of the stars. */
  size?: 'sm' | 'md' | 'lg';
}

/* ------------------------------------------------------------------ */
/*  Component implementation                                           */
/* ------------------------------------------------------------------ */

export default function BookTrackerRatingStars({
  value,
  onChange,
  readOnly = false,
  size = 'md',
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

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

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
          <motion.button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === value}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
            disabled={!interactive}
            onClick={(): void => handleClick(star)}
            onMouseEnter={(): void => handleMouseEnter(star)}
            whileHover={interactive ? { scale: 1.1 } : {}}
            whileTap={interactive ? { scale: 0.9 } : {}}
            className={cn(
              'transition-colors disabled:cursor-default',
              interactive && 'cursor-pointer',
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                'transition-all duration-200',
                filled
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-none text-zinc-300 dark:text-zinc-600',
              )}
            />
          </motion.button>
        );
      })}
    </div>
  );
}
