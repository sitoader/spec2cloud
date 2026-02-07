'use client';

/**
 * BookTracker — Discover & Search page.
 *
 * Combines the search bar, results grid, and detail modal into a
 * single orchestrator that manages state for the entire discovery flow.
 */

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { BookTrackerBookStatus } from '@/types';
import type { BookTrackerExternalBook } from '@/types';
import { bookTrackerSearchBooks, bookTrackerSearchReadableError } from '@/lib/api/search';
import { bookTrackerAddBook } from '@/lib/api/books';
import BookTrackerSearchBar from '@/components/search/BookTrackerSearchBar';
import BookTrackerSearchResults from '@/components/search/BookTrackerSearchResults';
import BookTrackerBookDetailModal from '@/components/search/BookTrackerBookDetailModal';

/* ------------------------------------------------------------------ */
/*  Status helpers                                                     */
/* ------------------------------------------------------------------ */

type ShelfChoice = 'ToRead' | 'Reading';

const SHELF_TO_STATUS: Record<ShelfChoice, BookTrackerBookStatus> = {
  ToRead: BookTrackerBookStatus.ToRead,
  Reading: BookTrackerBookStatus.Reading,
};

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function BookTrackerSearchPage(): React.JSX.Element {
  const [searchHits, setSearchHits] = useState<BookTrackerExternalBook[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorBanner, setErrorBanner] = useState('');
  const [successBanner, setSuccessBanner] = useState('');
  const [detailSubject, setDetailSubject] = useState<BookTrackerExternalBook | null>(null);

  /* ---- Search handler ---- */

  const performSearch = useCallback(async (phrase: string): Promise<void> => {
    setErrorBanner('');
    setSuccessBanner('');

    if (phrase.length === 0) {
      setSearchHits([]);
      setHasSearched(false);
      return;
    }

    setSearching(true);
    try {
      const results = await bookTrackerSearchBooks(phrase);
      setSearchHits(results);
      setHasSearched(true);
    } catch (err: unknown) {
      setErrorBanner(bookTrackerSearchReadableError(err));
      setSearchHits([]);
      setHasSearched(true);
    } finally {
      setSearching(false);
    }
  }, []);

  /* ---- Add-to-library handler ---- */

  const shelveBook = useCallback(
    async (book: BookTrackerExternalBook, shelf: ShelfChoice): Promise<void> => {
      setErrorBanner('');
      setSuccessBanner('');

      try {
        await bookTrackerAddBook({
          title: book.title,
          author: book.author,
          isbn: book.isbn ?? undefined,
          coverImageUrl: book.coverImageUrl ?? undefined,
          description: book.description ?? undefined,
          genres: book.genres ?? undefined,
          publicationDate: book.publicationYear ? `${book.publicationYear}-01-01` : undefined,
          status: SHELF_TO_STATUS[shelf],
          source: book.source ?? undefined,
        });
        setSuccessBanner(`"${book.title}" added to your library!`);
      } catch (err: unknown) {
        setErrorBanner(
          err instanceof Error ? err.message : 'Could not add book to library.',
        );
      }
    },
    [],
  );

  /* ---- Detail modal ---- */

  const openDetail = useCallback((book: BookTrackerExternalBook): void => {
    setDetailSubject(book);
  }, []);

  const closeDetail = useCallback((): void => {
    setDetailSubject(null);
  }, []);

  /* ---- Render ---- */

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Discover Books
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Search external catalogues and add books to your library
          </p>
        </div>
        <Link
          href="/books"
          className="inline-flex items-center justify-center rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          ← My Library
        </Link>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <BookTrackerSearchBar onSearchRequest={performSearch} isBusy={searching} />
      </div>

      {/* Banners */}
      {errorBanner && (
        <div
          role="alert"
          className="mb-6 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
        >
          {errorBanner}
        </div>
      )}
      {successBanner && (
        <div
          role="status"
          className="mb-6 rounded-md border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
        >
          {successBanner}
        </div>
      )}

      {/* Results grid */}
      <BookTrackerSearchResults
        hits={searchHits}
        isBusy={searching}
        hasSearched={hasSearched}
        onAddToLibrary={shelveBook}
        onOpenDetail={openDetail}
      />

      {/* Detail modal */}
      <BookTrackerBookDetailModal
        externalBook={detailSubject}
        onDismiss={closeDetail}
        onAddToLibrary={shelveBook}
      />
    </div>
  );
}
