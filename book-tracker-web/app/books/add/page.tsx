/**
 * BookTracker add publication page.
 *
 * Renders form interface for capturing new book entries
 * and submitting them to the library collection.
 */

import { BookTrackerAddBookForm } from '@/components/books/AddBookForm';

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function BookTrackerAddBookPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Add New Book
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Fill in the details below to add a book to your library
        </p>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <BookTrackerAddBookForm />
      </div>
    </div>
  );
}
