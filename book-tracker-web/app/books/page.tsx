'use client';

/**
 * BookTracker books listing orchestrator page.
 *
 * Manages complete book collection display with filtering,
 * search capabilities, and pagination controls.
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { BookTrackerBookStatus } from '@/types';
import type { BookTrackerBook } from '@/types';
import { bookTrackerGetBooks } from '@/lib/api/books';
import { BookTrackerBookGrid } from '@/components/books/BookGrid';
import { BookTrackerBookFilters } from '@/components/books/BookFilters';

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function BookTrackerBooksListingPage(): React.JSX.Element {
  const [publicationSet, setPublicationSet] = useState<BookTrackerBook[]>([]);
  const [filteredPublications, setFilteredPublications] = useState<BookTrackerBook[]>([]);
  const [activeStatus, setActiveStatus] = useState<BookTrackerBookStatus | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string>('');

  const fetchPublications = useCallback(async () => {
    setIsLoadingData(true);
    setLoadError('');

    try {
      const response = await bookTrackerGetBooks(undefined, 1, 100);
      setPublicationSet(response.items);
      setFilteredPublications(response.items);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load books');
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchPublications();
  }, [fetchPublications]);

  const applyFilters = useCallback(() => {
    let results = publicationSet;

    if (activeStatus !== undefined) {
      results = results.filter((pub) => pub.status === activeStatus);
    }

    if (searchQuery.length > 0) {
      const lowercaseQuery = searchQuery.toLowerCase();
      results = results.filter(
        (pub) =>
          pub.title.toLowerCase().includes(lowercaseQuery) ||
          pub.author.toLowerCase().includes(lowercaseQuery)
      );
    }

    setFilteredPublications(results);
  }, [publicationSet, activeStatus, searchQuery]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleStatusChange = useCallback((status: BookTrackerBookStatus | undefined) => {
    setActiveStatus(status);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header section */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            My Library
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {publicationSet.length} {publicationSet.length === 1 ? 'book' : 'books'} in your collection
          </p>
        </div>
        <Link
          href="/books/add"
          className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Add New Book
        </Link>
      </div>

      {/* Error banner */}
      {loadError && (
        <div
          role="alert"
          className="mb-6 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
        >
          {loadError}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6">
        <BookTrackerBookFilters
          activeStatusFilter={activeStatus}
          searchPhrase={searchQuery}
          onStatusToggle={handleStatusChange}
          onSearchModify={handleSearchChange}
        />
      </div>

      {/* Loading state */}
      {isLoadingData && (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-800 dark:border-t-zinc-200"></div>
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              Loading your library...
            </p>
          </div>
        </div>
      )}

      {/* Books grid */}
      {!isLoadingData && (
        <BookTrackerBookGrid
          publicationSet={filteredPublications}
          emptyStateText={
            searchQuery.length > 0 || activeStatus !== undefined
              ? 'No books match your filters'
              : 'Your library is empty'
          }
        />
      )}
    </div>
  );
}
