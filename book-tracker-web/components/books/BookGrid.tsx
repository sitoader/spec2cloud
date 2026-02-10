'use client';

/**
 * BookTrackerBookGrid — collection display orchestrator.
 *
 * Renders book arrays through responsive grid allocation with
 * adaptive column density and vacancy state visualization.
 */

import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import type { BookTrackerBook } from '@/types';
import { BookTrackerBookCard } from './BookCard';
import { BookTrackerBookCardSkeleton } from './BookCardSkeleton';

/* ------------------------------------------------------------------ */
/*  Interface declarations                                             */
/* ------------------------------------------------------------------ */

interface BookTrackerBookGridProps {
  publicationSet: BookTrackerBook[];
  emptyStateText?: string;
  isLoading?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Component implementation                                           */
/* ------------------------------------------------------------------ */

export function BookTrackerBookGrid({
  publicationSet,
  emptyStateText = 'Your library awaits its first entry',
  isLoading = false,
}: BookTrackerBookGridProps): React.JSX.Element {
  // Show skeleton loading state
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
        role="status"
        aria-label="Loading books"
      >
        {Array.from({ length: 8 }).map((_, idx) => (
          <BookTrackerBookCardSkeleton key={idx} />
        ))}
      </div>
    );
  }

  const hasNoPublications = publicationSet.length === 0;

  if (hasNoPublications) {
    return (
      <div
        className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50"
        role="status"
        aria-label="Empty library state"
      >
        <div className="text-center">
          <BookOpen className="mx-auto h-16 w-16 text-zinc-400 dark:text-zinc-600" aria-hidden="true" />
          <p className="mt-4 text-base font-medium text-zinc-700 dark:text-zinc-300">
            {emptyStateText}
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
            Add your first book to begin tracking your reading journey
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.05,
          },
        },
      }}
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
      role="list"
      aria-label="Books collection"
    >
      {publicationSet.map((pub) => (
        <div key={pub.id} role="listitem" className="h-full">
          <BookTrackerBookCard publication={pub} />
        </div>
      ))}
    </motion.div>
  );
}
