'use client';

/**
 * BookTracker book detail page.
 */

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useBookTrackerIdentity } from '@/lib/contexts/AuthContext';
import { bookTrackerGetBook, bookTrackerBookReadableError } from '@/lib/api/books';
import BookTrackerBookDetail from '@/components/books/BookTrackerBookDetail';
import type { BookTrackerBook } from '@/types';

export default function BookTrackerBookDetailPage(): React.JSX.Element {
  const params = useParams<{ id: string }>();
  const { recognized, hydrating } = useBookTrackerIdentity();

  const [book, setBook] = useState<BookTrackerBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (hydrating || !recognized || !params.id) return;

    let stale = false;

    const load = async (): Promise<void> => {
      try {
        const data = await bookTrackerGetBook(params.id);
        if (!stale) setBook(data);
      } catch (err: unknown) {
        if (!stale) setError(bookTrackerBookReadableError(err));
      } finally {
        if (!stale) setLoading(false);
      }
    };

    void load();

    return (): void => {
      stale = true;
    };
  }, [hydrating, recognized, params.id]);

  if (hydrating || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">Loading…</p>
      </div>
    );
  }

  if (!recognized) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-zinc-500">Please sign in to view this book.</p>
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
      <main className="container mx-auto max-w-3xl px-4 py-8">
        {error ? (
          <div
            role="alert"
            className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
          >
            {error}
          </div>
        ) : book ? (
          <BookTrackerBookDetail book={book} />
        ) : (
          <p className="text-center text-zinc-500">Book not found.</p>
        )}
      </main>
    </div>
  );
}
