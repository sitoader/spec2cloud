'use client';

/**
 * Responsive grid for displaying book cards.
 */

import BookTrackerBookCard from '@/components/books/BookTrackerBookCard';
import type { BookTrackerBook } from '@/types';

interface BookTrackerBookGridProps {
  books: BookTrackerBook[];
  loading?: boolean;
}

function BookTrackerBookGridSkeleton(): React.JSX.Element {
  return (
    <div
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
      aria-label="Loading books"
    >
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800"
        >
          <div className="aspect-[2/3] w-full bg-zinc-200 dark:bg-zinc-700" />
          <div className="space-y-2 p-3">
            <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-3 w-1/2 rounded bg-zinc-200 dark:bg-zinc-700" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BookTrackerBookGrid({
  books,
  loading = false,
}: BookTrackerBookGridProps): React.JSX.Element {
  if (loading) {
    return <BookTrackerBookGridSkeleton />;
  }

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="text-5xl">📚</span>
        <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          No books yet
        </h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Add your first book to get started with your reading library.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {books.map((book) => (
        <BookTrackerBookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
