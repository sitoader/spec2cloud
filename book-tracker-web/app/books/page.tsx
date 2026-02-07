'use client';

/**
 * BookTracker book library page.
 *
 * Displays the user's books in a filterable grid.
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useBookTrackerIdentity } from '@/lib/contexts/AuthContext';
import { bookTrackerGetBooks, bookTrackerBookReadableError } from '@/lib/api/books';
import BookTrackerBookGrid from '@/components/books/BookTrackerBookGrid';
import BookTrackerBookFilters from '@/components/books/BookTrackerBookFilters';
import type { BookTrackerBook, BookTrackerBookStatus } from '@/types';

export default function BookTrackerBooksPage(): React.JSX.Element {
  const { recognized, hydrating } = useBookTrackerIdentity();

  const [books, setBooks] = useState<BookTrackerBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<BookTrackerBookStatus | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [banner, setBanner] = useState('');

  const fetchBooks = useCallback(async (): Promise<void> => {
    setLoading(true);
    setBanner('');
    try {
      const apiStatus = statusFilter || undefined;
      const response = await bookTrackerGetBooks(apiStatus, 1, 100);
      setBooks(response.items);
    } catch (err: unknown) {
      setBanner(bookTrackerBookReadableError(err));
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (hydrating) return;
    if (!recognized) return;
    void fetchBooks();
  }, [hydrating, recognized, fetchBooks]);

  /* Client-side search filtering */
  const displayBooks = searchQuery
    ? books.filter((b) => {
        const q = searchQuery.toLowerCase();
        return (
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q)
        );
      })
    : books;

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
        <p className="text-zinc-500">Please sign in to view your library.</p>
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
              className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
            >
              My Library
            </Link>
            <Link
              href="/books/add"
              className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              + Add Book
            </Link>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            My Library
          </h1>
        </div>

        {banner && (
          <div
            role="alert"
            className="mb-6 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
          >
            {banner}
          </div>
        )}

        <div className="mb-6">
          <BookTrackerBookFilters
            statusFilter={statusFilter}
            searchQuery={searchQuery}
            onStatusChange={setStatusFilter}
            onSearchChange={setSearchQuery}
          />
        </div>

        <BookTrackerBookGrid books={displayBooks} loading={loading} />
      </main>
    </div>
  );
}
