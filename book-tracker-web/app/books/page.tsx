'use client';

/**
 * BookTracker books listing orchestrator page.
 *
 * Manages complete book collection display with filtering,
 * search capabilities, and pagination controls.
 */

import { useCallback, useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { BookOpen, BookMarked, BookCheck, Plus, Search, Globe } from 'lucide-react';
import { BookTrackerBookStatus } from '@/types';
import type { BookTrackerBook, BookTrackerCollection, BookTrackerExternalBook } from '@/types';
import { bookTrackerGetBooks, bookTrackerAddBook, bookTrackerReadableError } from '@/lib/api/books';
import { bookTrackerListCollections } from '@/lib/api/collections';
import { bookTrackerSearchBooks, bookTrackerSearchReadableError } from '@/lib/api/search';
import { BookTrackerBookGrid } from '@/components/books/BookGrid';
import { BookTrackerBookFilters } from '@/components/books/BookFilters';
import { BookTrackerHeader } from '@/components/layout/Header';
import { CollectionCard } from '@/components/collections/CollectionCard';
import { CreateCollectionDialog } from '@/components/collections/CreateCollectionDialog';
import BookTrackerSearchBar from '@/components/search/BookTrackerSearchBar';
import BookTrackerSearchResults from '@/components/search/BookTrackerSearchResults';
import BookTrackerBookDetailModal from '@/components/search/BookTrackerBookDetailModal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/* ------------------------------------------------------------------ */
/*  Status helpers (for Discover tab add-to-library flow)              */
/* ------------------------------------------------------------------ */

type ShelfChoice = 'ToRead' | 'Reading';

const SHELF_TO_STATUS: Record<ShelfChoice, BookTrackerBookStatus> = {
  ToRead: BookTrackerBookStatus.ToRead,
  Reading: BookTrackerBookStatus.Reading,
};

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function BookTrackerBooksListingPage(): React.JSX.Element {
  /* ---- My Books state ---- */
  const [publicationSet, setPublicationSet] = useState<BookTrackerBook[]>([]);
  const [filteredPublications, setFilteredPublications] = useState<BookTrackerBook[]>([]);
  const [activeStatus, setActiveStatus] = useState<BookTrackerBookStatus | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string>('');

  /* ---- Collections state ---- */
  const [collections, setCollections] = useState<BookTrackerCollection[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [showCreateCollection, setShowCreateCollection] = useState(false);

  /* ---- Discover state ---- */
  const [discoverHits, setDiscoverHits] = useState<BookTrackerExternalBook[]>([]);
  const [discoverSearching, setDiscoverSearching] = useState(false);
  const [discoverSearched, setDiscoverSearched] = useState(false);
  const [discoverError, setDiscoverError] = useState('');
  const [discoverSuccess, setDiscoverSuccess] = useState('');
  const [discoverDetail, setDiscoverDetail] = useState<BookTrackerExternalBook | null>(null);

  /* ================================================================ */
  /*  Data fetching                                                    */
  /* ================================================================ */

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

  const fetchCollections = useCallback(async () => {
    setCollectionsLoading(true);
    try {
      const data = await bookTrackerListCollections();
      setCollections(data);
    } catch {
      // silent
    } finally {
      setCollectionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPublications();
    fetchCollections();
  }, [fetchPublications, fetchCollections]);

  /* ================================================================ */
  /*  Books tab filters                                                */
  /* ================================================================ */

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

  /* ================================================================ */
  /*  Discover tab handlers                                            */
  /* ================================================================ */

  const performDiscoverSearch = useCallback(async (phrase: string): Promise<void> => {
    setDiscoverError('');
    setDiscoverSuccess('');

    if (phrase.length === 0) {
      setDiscoverHits([]);
      setDiscoverSearched(false);
      return;
    }

    setDiscoverSearching(true);
    try {
      const results = await bookTrackerSearchBooks(phrase);
      setDiscoverHits(results);
      setDiscoverSearched(true);
    } catch (err: unknown) {
      setDiscoverError(bookTrackerSearchReadableError(err));
      setDiscoverHits([]);
      setDiscoverSearched(true);
    } finally {
      setDiscoverSearching(false);
    }
  }, []);

  const shelveDiscoverBook = useCallback(
    async (book: BookTrackerExternalBook, shelf: ShelfChoice): Promise<void> => {
      setDiscoverError('');
      setDiscoverSuccess('');

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
        setDiscoverSuccess(`"${book.title}" added to your library!`);
        // Refresh library books so user sees the new book immediately if they switch tabs
        fetchPublications();
      } catch (err: unknown) {
        setDiscoverError(bookTrackerReadableError(err));
      }
    },
    [fetchPublications],
  );

  const openDiscoverDetail = useCallback((book: BookTrackerExternalBook): void => {
    setDiscoverDetail(book);
  }, []);

  const closeDiscoverDetail = useCallback((): void => {
    setDiscoverDetail(null);
  }, []);

  /* ================================================================ */
  /*  Stats                                                            */
  /* ================================================================ */

  const stats = useMemo(() => {
    return {
      total: publicationSet.length,
      toRead: publicationSet.filter(b => b.status === BookTrackerBookStatus.ToRead).length,
      reading: publicationSet.filter(b => b.status === BookTrackerBookStatus.Reading).length,
      completed: publicationSet.filter(b => b.status === BookTrackerBookStatus.Completed).length,
    };
  }, [publicationSet]);

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

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
        </div>

        <Tabs defaultValue="books" className="space-y-6">
          <TabsList>
            <TabsTrigger value="books">
              <BookOpen className="mr-1.5 h-3.5 w-3.5" /> My Books
            </TabsTrigger>
            <TabsTrigger value="discover">
              <Globe className="mr-1.5 h-3.5 w-3.5" /> Discover
            </TabsTrigger>
            <TabsTrigger value="collections">
              <span className="mr-1.5">📁</span> Collections
            </TabsTrigger>
          </TabsList>

          {/* ============================================================ */}
          {/* My Books Tab                                                  */}
          {/* ============================================================ */}
          <TabsContent value="books" className="space-y-6">
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

            {/* Error banner */}
            {loadError && (
              <div
                role="alert"
                className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
              >
                {loadError}
              </div>
            )}

            {/* Filters */}
            <div>
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
          </TabsContent>

          {/* ============================================================ */}
          {/* Discover Tab                                                  */}
          {/* ============================================================ */}
          <TabsContent value="discover" className="space-y-6">
            {/* Intro */}
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-700 dark:bg-zinc-800/50">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-violet-100 p-2.5 dark:bg-violet-900/30">
                  <Search className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    Search External Catalogues
                  </h2>
                  <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                    Find books from online sources and add them to your library with one click.
                  </p>
                </div>
              </div>
            </div>

            {/* Search bar */}
            <BookTrackerSearchBar onSearchRequest={performDiscoverSearch} isBusy={discoverSearching} />

            {/* Banners */}
            {discoverError && (
              <div
                role="alert"
                className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
              >
                {discoverError}
              </div>
            )}
            {discoverSuccess && (
              <div
                role="status"
                className="rounded-md border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
              >
                {discoverSuccess}
              </div>
            )}

            {/* Results */}
            <BookTrackerSearchResults
              hits={discoverHits}
              isBusy={discoverSearching}
              hasSearched={discoverSearched}
              onAddToLibrary={shelveDiscoverBook}
              onOpenDetail={openDiscoverDetail}
            />

            {/* Detail modal */}
            <BookTrackerBookDetailModal
              externalBook={discoverDetail}
              onDismiss={closeDiscoverDetail}
              onAddToLibrary={shelveDiscoverBook}
            />
          </TabsContent>

          {/* ============================================================ */}
          {/* Collections Tab                                               */}
          {/* ============================================================ */}
          <TabsContent value="collections">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Organize your books into themed lists
              </p>
              <button
                type="button"
                onClick={() => setShowCreateCollection(true)}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
              >
                + New Collection
              </button>
            </div>

            {collectionsLoading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-3 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-zinc-200" />
              </div>
            ) : collections.length === 0 ? (
              <div className="py-16 text-center">
                <span className="text-5xl">📁</span>
                <h2 className="mt-4 text-lg font-semibold text-zinc-700 dark:text-zinc-300">
                  No collections yet
                </h2>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  Create your first collection to organize your books
                </p>
                <button
                  type="button"
                  onClick={() => setShowCreateCollection(true)}
                  className="mt-4 rounded-lg bg-emerald-600 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Create Collection
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {collections.map((col) => (
                  <CollectionCard key={col.id} collection={col} />
                ))}
              </div>
            )}

            <CreateCollectionDialog
              open={showCreateCollection}
              onClose={() => setShowCreateCollection(false)}
              onCreated={(created) => {
                setCollections((prev) => [created, ...prev]);
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
