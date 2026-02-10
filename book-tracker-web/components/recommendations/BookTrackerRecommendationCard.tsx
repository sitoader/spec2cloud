'use client';

/**
 * BookTrackerRecommendationCard — individual recommendation tile.
 *
 * Displays a single AI-generated book recommendation with cover image,
 * title, author, genre, explanation snippet, confidence score,
 * and action buttons. Clickable to open full detail modal.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/* ------------------------------------------------------------------ */
/*  Interface declarations                                             */
/* ------------------------------------------------------------------ */

interface BookTrackerRecommendationCardProps {
  title: string;
  author: string;
  genre?: string;
  coverImageUrl?: string;
  onAddToTbr: () => Promise<void>;
  onDismiss: () => void;
  onViewDetails: () => void;
  isAdded?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Component implementation                                           */
/* ------------------------------------------------------------------ */

export function BookTrackerRecommendationCard({
  title,
  author,
  genre,
  coverImageUrl,
  onAddToTbr,
  onDismiss,
  onViewDetails,
  isAdded = false,
}: BookTrackerRecommendationCardProps): React.JSX.Element {
  const [isAdding, setIsAdding] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const handleAdd = async (): Promise<void> => {
    setIsAdding(true);
    try {
      await onAddToTbr();
    } catch {
      // Parent handles error display — swallow here to prevent
      // unhandled rejection from reaching error boundary.
    } finally {
      setIsAdding(false);
    }
  };

  const handleDismiss = (): void => {
    setIsDismissed(true);
    onDismiss();
  };

  if (isDismissed) return <></>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <div className="group flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800 outline-none">
        {/* Clickable area — opens detail modal */}
        <button
          type="button"
          onClick={onViewDetails}
          className="flex w-full flex-1 cursor-pointer flex-col text-left outline-none"
          aria-label={`View details for ${title}`}
        >
          {/* Cover image */}
          <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-700">
            {coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverImageUrl}
                alt={`Cover of ${title}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
                <span className="text-4xl">
                  {/^[a-zA-Z]$/.test(title.trim().charAt(0)) ? title.trim().charAt(0).toUpperCase() : '📖'}
                </span>
              </div>
            )}
            {genre && (
              <div className="absolute right-2 top-2">
                <Badge variant="secondary" className="text-xs">
                  {genre}
                </Badge>
              </div>
            )}
          </div>

          {/* Info — matches library card sizing */}
          <div className="flex flex-1 flex-col p-3">
            <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900 group-hover:text-zinc-700 dark:text-zinc-100 dark:group-hover:text-zinc-300">
              {title}
            </h3>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {author}
            </p>
          </div>
        </button>

        {/* Compact action footer */}
        <div className="flex items-center gap-2 border-t border-zinc-100 px-3 py-2 dark:border-zinc-700">
          {isAdded ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
              <Check className="mr-1 h-3 w-3" />
              Added
            </Badge>
          ) : (
            <>
              <Button
                onClick={(e): void => { e.stopPropagation(); void handleAdd(); }}
                disabled={isAdding}
                size="sm"
                className="h-7 px-2 text-xs"
              >
                {isAdding && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                {isAdding ? 'Adding...' : 'Add to TBR'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={(e): void => { e.stopPropagation(); handleDismiss(); }}
              >
                <X className="mr-1 h-3 w-3" />
                Dismiss
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
