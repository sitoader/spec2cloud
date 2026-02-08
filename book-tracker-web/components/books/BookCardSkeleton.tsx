'use client';

/**
 * BookTrackerBookCardSkeleton — loading placeholder component.
 *
 * Renders animated skeleton matching BookCard structure
 * for seamless loading state visualization.
 */

import { Skeleton } from '@/components/ui/skeleton';

export function BookTrackerBookCardSkeleton(): React.JSX.Element {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {/* Cover image skeleton */}
      <Skeleton className="aspect-[2/3] w-full" />
      
      {/* Content skeleton */}
      <div className="flex flex-col gap-2 p-4">
        {/* Title */}
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        
        {/* Author */}
        <Skeleton className="mt-1 h-4 w-1/2" />
        
        {/* Description */}
        <Skeleton className="mt-2 h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        
        {/* Genre tags */}
        <div className="flex gap-1.5 pt-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-14" />
        </div>
      </div>
    </div>
  );
}
