'use client';

/**
 * BookTracker add-book page.
 */

import Link from 'next/link';
import { useBookTrackerIdentity } from '@/lib/contexts/AuthContext';
import BookTrackerAddBookForm from '@/components/books/BookTrackerAddBookForm';

export default function BookTrackerAddBookPage(): React.JSX.Element {
  const { recognized, hydrating } = useBookTrackerIdentity();

  if (hydrating) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">Loading…</p>
      </div>
    );
  }

  if (!recognized) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-zinc-500">Please sign in to add books.</p>
        <Link
          href="/login"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-200 dark:text-zinc-900"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/80">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            📚 BookTracker
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/books"
              className="text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
            >
              ← Back to library
            </Link>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto max-w-lg px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Add a Book
        </h1>
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-800">
          <BookTrackerAddBookForm />
        </div>
      </main>
    </div>
  );
}
