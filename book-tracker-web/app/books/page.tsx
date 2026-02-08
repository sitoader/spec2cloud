'use client';

/**
 * BookTracker books listing orchestrator page.
 *
 * Manages complete book collection display with filtering,
 * search capabilities, and pagination controls.
 */

import { useCallback, useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { BookOpen, BookMarked, BookCheck, Plus } from 'lucide-react';
import { BookTrackerBookStatus } from '@/types';
import type { BookTrackerBook } from '@/types';
import { bookTrackerGetBooks } from '@/lib/api/books';
import { BookTrackerBookGrid } from '@/components/books/BookGrid';
import { BookTrackerBookFilters } from '@/components/books/BookFilters';
import { BookTrackerHeader } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: publicationSet.length,
      toRead: publicationSet.filter(b => b.status === BookTrackerBookStatus.ToRead).length,
      reading: publicationSet.filter(b => b.status === BookTrackerBookStatus.Reading).length,
      completed: publicationSet.filter(b => b.status === BookTrackerBookStatus.Completed).length,
    };
  }, [publicationSet]);

  return (
    <>
      <BookTrackerHeader />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header section */}
        <div className="mb-6">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                My Library
              </h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {stats.total} {stats.total === 1 ? 'book' : 'books'} in your collection
              </p>
            </div>
            <Button asChild>
              <Link href="/books/add">
                <Plus className="mr-2 h-4 w-4" />
                Add New Book
              </Link>
            </Button>
          </div>

          {/* Stats cards */}
          {!isLoadingData && stats.total > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">To Read</p>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.toRead}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-lg bg-amber-100 p-3 dark:bg-amber-900/30">
                    <BookMarked className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Reading</p>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.reading}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-lg bg-emerald-100 p-3 dark:bg-emerald-900/30">
                    <BookCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Completed</p>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.completed}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
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

      {/* Books grid with loading state */}
      <BookTrackerBookGrid
        publicationSet={filteredPublications}
        isLoading={isLoadingData}
        emptyStateText={
          searchQuery.length > 0 || activeStatus !== undefined
            ? 'No books match your filters'
            : 'Your library is empty'
        }
      />
      </div>
    </>
  );
}
