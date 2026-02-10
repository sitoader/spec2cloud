'use client';

/**
 * BookTracker books listing orchestrator page.
 *
 * Manages complete book collection display with filtering,
 * search capabilities, and pagination controls.
 */

import { useCallback, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, BookMarked, BookCheck, Plus, Search, Globe, Sparkles } from 'lucide-react';
import { BookTrackerBookStatus } from '@/types';
import type { BookTrackerBook, BookTrackerCollection, BookTrackerExternalBook, BookTrackerBookRecommendation } from '@/types';
import { bookTrackerGetBooks, bookTrackerAddBook, bookTrackerReadableError } from '@/lib/api/books';
import { bookTrackerListCollections } from '@/lib/api/collections';
import { bookTrackerSearchBooks, bookTrackerSearchReadableError } from '@/lib/api/search';
import {
  bookTrackerGenerateRecommendations,
  bookTrackerRecommendationsReadableError,
  bookTrackerIsRateLimited,
} from '@/lib/api/recommendations';
import { ApiError } from '@/lib/api/client';
import { BookTrackerBookGrid } from '@/components/books/BookGrid';
import { BookTrackerBookFilters } from '@/components/books/BookFilters';
import type { SortField, RatingFilter } from '@/components/books/BookFilters';
import { BookTrackerHeader } from '@/components/layout/Header';
import { CollectionCard } from '@/components/collections/CollectionCard';
import { CreateCollectionDialog } from '@/components/collections/CreateCollectionDialog';
import BookTrackerSearchBar from '@/components/search/BookTrackerSearchBar';
import BookTrackerSearchResults from '@/components/search/BookTrackerSearchResults';
import BookTrackerBookDetailModal from '@/components/search/BookTrackerBookDetailModal';
import { BookTrackerGenerateButton } from '@/components/recommendations/BookTrackerGenerateButton';
import { BookTrackerInsufficientDataBanner } from '@/components/recommendations/BookTrackerInsufficientDataBanner';
import { BookTrackerRecommendationsList } from '@/components/recommendations/BookTrackerRecommendationsList';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

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
  const searchParams = useSearchParams();

  /* ---- My Books state ---- */
  const [publicationSet, setPublicationSet] = useState<BookTrackerBook[]>([]);
  const [filteredPublications, setFilteredPublications] = useState<BookTrackerBook[]>([]);
  const [activeStatus, setActiveStatus] = useState<BookTrackerBookStatus | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam === 'rated' || filterParam === 'unrated') return filterParam;
    return 'all';
  });
  const [genreFilter, setGenreFilter] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('addedDate');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
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

  /* ---- AI Picks state ---- */
  const [aiRatedCount, setAiRatedCount] = useState<number>(0);
  const [aiCheckingData, setAiCheckingData] = useState(true);
  const [aiRecommendations, setAiRecommendations] = useState<BookTrackerBookRecommendation[]>([]);
  const [aiGeneratedAt, setAiGeneratedAt] = useState<string | null>(null);
  const [aiBooksAnalyzed, setAiBooksAnalyzed] = useState<number>(0);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiRateLimited, setAiRateLimited] = useState(false);
  const [aiAddedTitles, setAiAddedTitles] = useState<Set<string>>(new Set());

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

  /* Check rated-book count for AI Picks */
  const checkRatedBooks = useCallback(() => {
    const rated = publicationSet.filter((b) => b.rating !== undefined && b.rating !== null);
    setAiRatedCount(rated.length);
    setAiCheckingData(false);
  }, [publicationSet]);

  useEffect(() => {
    if (!isLoadingData) checkRatedBooks();
  }, [isLoadingData, checkRatedBooks]);

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

    // Rating filter
    if (ratingFilter === 'rated') {
      results = results.filter((pub) => pub.rating && pub.rating.score > 0);
    } else if (ratingFilter === 'unrated') {
      results = results.filter((pub) => !pub.rating || pub.rating.score === 0);
    } else if (ratingFilter !== 'all') {
      const minRating = Number(ratingFilter);
      results = results.filter((pub) => pub.rating && pub.rating.score >= minRating);
    }

    // Genre filter
    if (genreFilter) {
      results = results.filter(
        (pub) => pub.genres && pub.genres.some((g) => g.toLowerCase() === genreFilter.toLowerCase())
      );
    }

    // Sort
    results = [...results].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'title':
          cmp = a.title.localeCompare(b.title);
          break;
        case 'author':
          cmp = a.author.localeCompare(b.author);
          break;
        case 'rating': {
          const ra = a.rating?.score ?? 0;
          const rb = b.rating?.score ?? 0;
          cmp = ra - rb;
          break;
        }
        case 'addedDate':
        default:
          cmp = new Date(a.addedDate).getTime() - new Date(b.addedDate).getTime();
          break;
      }
      return sortAsc ? cmp : -cmp;
    });

    setFilteredPublications(results);
  }, [publicationSet, activeStatus, searchQuery, ratingFilter, genreFilter, sortField, sortAsc]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleStatusChange = useCallback((status: BookTrackerBookStatus | undefined) => {
    setActiveStatus(status);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleRatingChange = useCallback((rating: RatingFilter) => {
    setRatingFilter(rating);
  }, []);

  const handleGenreChange = useCallback((genre: string) => {
    setGenreFilter(genre);
  }, []);

  const handleSortFieldChange = useCallback((field: SortField) => {
    setSortField(field);
  }, []);

  const handleSortDirectionToggle = useCallback(() => {
    setSortAsc((prev) => !prev);
  }, []);

  /* Compute available genres from user's library */
  const availableGenres = useMemo(() => {
    const genreSet = new Set<string>();
    for (const book of publicationSet) {
      if (book.genres) {
        for (const g of book.genres) genreSet.add(g);
      }
    }
    return Array.from(genreSet).sort((a, b) => a.localeCompare(b));
  }, [publicationSet]);

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
          pageCount: book.pageCount ?? undefined,
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
  /*  AI Picks handlers                                                */
  /* ================================================================ */

  const MINIMUM_RATED_BOOKS = 3;
  const aiHasEnoughData = aiRatedCount >= MINIMUM_RATED_BOOKS;

  const handleAiGenerate = useCallback(async (): Promise<void> => {
    setAiGenerating(true);
    setAiError('');
    setAiRateLimited(false);
    try {
      const response = await bookTrackerGenerateRecommendations(10);
      setAiRecommendations(response.recommendations);
      setAiGeneratedAt(response.generatedAt);
      setAiBooksAnalyzed(response.booksAnalyzed);
    } catch (err) {
      if (bookTrackerIsRateLimited(err)) setAiRateLimited(true);
      setAiError(bookTrackerRecommendationsReadableError(err));
    } finally {
      setAiGenerating(false);
    }
  }, []);

  const handleAiAddToTbr = useCallback(
    async (rec: BookTrackerBookRecommendation): Promise<void> => {
      try {
        const genres = rec.genres?.length ? rec.genres : rec.genre ? [rec.genre] : undefined;
        await bookTrackerAddBook({
          title: rec.title,
          author: rec.author,
          isbn: rec.isbn,
          coverImageUrl: rec.coverImageUrl,
          description: rec.description,
          genres,
          status: BookTrackerBookStatus.ToRead,
        });
        setAiAddedTitles((prev) => new Set(prev).add(rec.title));
      } catch (err: unknown) {
        if (err instanceof ApiError && err.status === 409) {
          setAiAddedTitles((prev) => new Set(prev).add(rec.title));
        } else {
          setAiError(err instanceof Error ? err.message : 'Failed to add book');
        }
      }
    },
    [],
  );

  const handleAiDismiss = useCallback((_rec: BookTrackerBookRecommendation): void => {
    // Dismissal handled visually by the card
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
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              My Library
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {stats.total} {stats.total === 1 ? 'book' : 'books'} in your collection
            </p>
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
            <TabsTrigger value="ai-picks">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> AI Picks
            </TabsTrigger>
          </TabsList>

          {/* ============================================================ */}
          {/* My Books Tab                                                  */}
          {/* ============================================================ */}
          <TabsContent value="books" className="space-y-6">
            {/* Stats cards — click to filter by status */}
            {!isLoadingData && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Card
                  className={`cursor-pointer transition-all ${
                    activeStatus === BookTrackerBookStatus.ToRead
                      ? 'ring-2 ring-blue-500 dark:ring-blue-400'
                      : 'hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                  onClick={() =>
                    handleStatusChange(
                      activeStatus === BookTrackerBookStatus.ToRead ? undefined : BookTrackerBookStatus.ToRead,
                    )
                  }
                >
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
                <Card
                  className={`cursor-pointer transition-all ${
                    activeStatus === BookTrackerBookStatus.Reading
                      ? 'ring-2 ring-amber-500 dark:ring-amber-400'
                      : 'hover:border-amber-300 dark:hover:border-amber-700'
                  }`}
                  onClick={() =>
                    handleStatusChange(
                      activeStatus === BookTrackerBookStatus.Reading ? undefined : BookTrackerBookStatus.Reading,
                    )
                  }
                >
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
                <Card
                  className={`cursor-pointer transition-all ${
                    activeStatus === BookTrackerBookStatus.Completed
                      ? 'ring-2 ring-emerald-500 dark:ring-emerald-400'
                      : 'hover:border-emerald-300 dark:hover:border-emerald-700'
                  }`}
                  onClick={() =>
                    handleStatusChange(
                      activeStatus === BookTrackerBookStatus.Completed ? undefined : BookTrackerBookStatus.Completed,
                    )
                  }
                >
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
                <Link href="/books/add" className="block">
                  <Card
                    className="h-full cursor-pointer border-dashed transition-all hover:border-violet-300 hover:bg-violet-50/50 dark:hover:border-violet-700 dark:hover:bg-violet-900/20"
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="rounded-lg bg-violet-100 p-3 dark:bg-violet-900/30">
                        <Plus className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Add Book</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-500">Add to library</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
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
                ratingFilter={ratingFilter}
                genreFilter={genreFilter}
                sortField={sortField}
                sortAsc={sortAsc}
                availableGenres={availableGenres}
                onStatusToggle={handleStatusChange}
                onSearchModify={handleSearchChange}
                onRatingChange={handleRatingChange}
                onGenreChange={handleGenreChange}
                onSortFieldChange={handleSortFieldChange}
                onSortDirectionToggle={handleSortDirectionToggle}
              />
            </div>

            {/* Books grid with loading state */}
            <BookTrackerBookGrid
              publicationSet={filteredPublications}
              isLoading={isLoadingData}
              emptyStateText={
                searchQuery.length > 0 || activeStatus !== undefined || ratingFilter !== 'all' || genreFilter !== ''
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

          {/* ============================================================ */}
          {/* AI Picks Tab                                                  */}
          {/* ============================================================ */}
          <TabsContent value="ai-picks" className="space-y-6">
            {/* Loading check */}
            {aiCheckingData && (
              <div className="flex min-h-[200px] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-800 dark:border-t-zinc-200" />
                  <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">Checking your library...</p>
                </div>
              </div>
            )}

            {/* Insufficient data banner */}
            {!aiCheckingData && !aiHasEnoughData && (
              <BookTrackerInsufficientDataBanner ratedCount={aiRatedCount} />
            )}

            {/* Main content */}
            {!aiCheckingData && aiHasEnoughData && (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <BookTrackerGenerateButton
                    onClick={(): void => { void handleAiGenerate(); }}
                    isGenerating={aiGenerating}
                    isDisabled={aiRateLimited}
                    hasExistingRecommendations={aiRecommendations.length > 0}
                  />
                  {aiGeneratedAt && (
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                      Generated {new Date(aiGeneratedAt).toLocaleString()} · {aiBooksAnalyzed} books analyzed
                    </div>
                  )}
                </div>

                {aiRateLimited && (
                  <div role="alert" className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    You&apos;ve reached today&apos;s limit (10). Try again tomorrow.
                  </div>
                )}

                {aiError && !aiRateLimited && (
                  <div role="alert" className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
                    <p>{aiError}</p>
                    <button
                      type="button"
                      onClick={(): void => { void handleAiGenerate(); }}
                      className="mt-2 text-sm font-medium text-red-700 underline hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
                    >
                      Try Again
                    </button>
                  </div>
                )}

                <BookTrackerRecommendationsList
                  recommendations={aiRecommendations}
                  isLoading={aiGenerating}
                  addedTitles={aiAddedTitles}
                  onAddToTbr={handleAiAddToTbr}
                  onDismiss={handleAiDismiss}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
