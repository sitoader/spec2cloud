'use client';

/**
 * BookTrackerRecommendationCard — individual recommendation tile.
 *
 * Displays a single AI-generated book recommendation with its title,
 * author, genre, explanation, confidence score, and action buttons.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import BookTrackerRatingStars from '@/components/ratings/BookTrackerRatingStars';

/* ------------------------------------------------------------------ */
/*  Interface declarations                                             */
/* ------------------------------------------------------------------ */

interface BookTrackerRecommendationCardProps {
  title: string;
  author: string;
  genre?: string;
  reason: string;
  confidenceScore: number;
  onAddToTbr: () => Promise<void>;
  onDismiss: () => void;
  isAdded?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Component implementation                                           */
/* ------------------------------------------------------------------ */

export function BookTrackerRecommendationCard({
  title,
  author,
  genre,
  reason,
  confidenceScore,
  onAddToTbr,
  onDismiss,
  isAdded = false,
}: BookTrackerRecommendationCardProps): React.JSX.Element {
  const [isAdding, setIsAdding] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const handleAdd = async (): Promise<void> => {
    setIsAdding(true);
    try {
      await onAddToTbr();
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
      <Card className="overflow-hidden transition-shadow duration-200 hover:shadow-lg">
        <CardHeader className="space-y-1 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold leading-tight">
                {title}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                By {author}
              </p>
            </div>
            {genre && (
              <Badge variant="secondary" className="shrink-0">
                {genre}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Confidence Score */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-500">Confidence:</span>
            <BookTrackerRatingStars 
              value={Math.round(confidenceScore)} 
              readOnly 
              size="sm"
            />
          </div>

          {/* Reason */}
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {reason}
          </p>
        </CardContent>

        <CardFooter className="flex items-center gap-3 pt-4">
          {isAdded ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
              <Check className="mr-1 h-3 w-3" />
              Added
            </Badge>
          ) : (
            <>
              <Button
                onClick={(): void => { void handleAdd(); }}
                disabled={isAdding}
                size="sm"
              >
                {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isAdding ? 'Adding...' : 'Add to TBR'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
              >
                <X className="mr-1 h-4 w-4" />
                Not Interested
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
