'use client';

/**
 * BookTrackerRecommendationLoading — loading state displayed while
 * AI recommendations are being generated.
 *
 * Shows skeleton cards with shimmer effect and a friendly message.
 */

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/* ------------------------------------------------------------------ */
/*  Component implementation                                           */
/* ------------------------------------------------------------------ */

export function BookTrackerRecommendationLoading(): React.JSX.Element {
  return (
    <div role="status" aria-label="Generating recommendations" className="space-y-6">
      <div className="text-center">
        <p className="text-base font-medium text-zinc-700 dark:text-zinc-300">
          Discovering books you&apos;ll love...
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          This may take a few seconds
        </p>
      </div>

      {/* Skeleton Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <Card key={idx} className="overflow-hidden">
            <CardHeader className="space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
            <CardFooter className="gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-32" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
