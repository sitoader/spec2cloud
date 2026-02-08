'use client';

/**
 * BookTracker AI recommendations page.
 *
 * Allows users with ≥3 rated books to generate AI-powered book
 * recommendations, view them in a grid, and add them to their TBR list.
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type { BookTrackerBookRecommendation } from '@/types';
import { BookTrackerBookStatus } from '@/types';
import { bookTrackerGetBooks } from '@/lib/api/books';
import { bookTrackerAddBook } from '@/lib/api/books';
import { ApiError } from '@/lib/api/client';
import {
  bookTrackerGenerateRecommendations,
  bookTrackerRecommendationsReadableError,
  bookTrackerIsRateLimited,
} from '@/lib/api/recommendations';
import { BookTrackerGenerateButton } from '@/components/recommendations/BookTrackerGenerateButton';
import { BookTrackerInsufficientDataBanner } from '@/components/recommendations/BookTrackerInsufficientDataBanner';
import { BookTrackerRecommendationsList } from '@/components/recommendations/BookTrackerRecommendationsList';
import { BookTrackerHeader } from '@/components/layout/Header';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const MINIMUM_RATED_BOOKS = 3;

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function BookTrackerRecommendationsPage(): React.JSX.Element {
  /* state */
  const [ratedCount, setRatedCount] = useState<number>(0);
  const [isCheckingData, setIsCheckingData] = useState(true);
  const [recommendations, setRecommendations] = useState<BookTrackerBookRecommendation[]>([]);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [booksAnalyzed, setBooksAnalyzed] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [addedTitles, setAddedTitles] = useState<Set<string>>(new Set());

  /* Check how many rated books the user has */
  const checkRatedBooks = useCallback(async (): Promise<void> => {
    setIsCheckingData(true);
    try {
      const response = await bookTrackerGetBooks(undefined, 1, 100);
      const rated = response.items.filter((b) => b.rating !== undefined && b.rating !== null);
      setRatedCount(rated.length);
    } catch {
      setRatedCount(0);
    } finally {
      setIsCheckingData(false);
    }
  }, []);

  useEffect(() => {
    void checkRatedBooks();
  }, [checkRatedBooks]);

  const hasEnoughData = ratedCount >= MINIMUM_RATED_BOOKS;

  /* Generate recommendations */
  const handleGenerate = useCallback(async (): Promise<void> => {
    setIsGenerating(true);
    setError('');
    setIsRateLimited(false);

    try {
      const response = await bookTrackerGenerateRecommendations(5);
      setRecommendations(response.recommendations);
      setGeneratedAt(response.generatedAt);
      setBooksAnalyzed(response.booksAnalyzed);
    } catch (err) {
      if (bookTrackerIsRateLimited(err)) {
        setIsRateLimited(true);
      }
      setError(bookTrackerRecommendationsReadableError(err));
    } finally {
      setIsGenerating(false);
    }
  }, []);

  /* Add recommendation to TBR */
  const handleAddToTbr = useCallback(
    async (rec: BookTrackerBookRecommendation): Promise<void> => {
      try {
        // Prefer enriched genres array, fall back to single AI genre
        const genres = rec.genres?.length
          ? rec.genres
          : rec.genre
            ? [rec.genre]
            : undefined;

        await bookTrackerAddBook({
          title: rec.title,
          author: rec.author,
          isbn: rec.isbn,
          coverImageUrl: rec.coverImageUrl,
          description: rec.description,
          genres,
          status: BookTrackerBookStatus.ToRead,
        });
        setAddedTitles((prev) => new Set(prev).add(rec.title));
      } catch (err: unknown) {
        // If book already exists (409), treat it as "already added"
        if (err instanceof ApiError && err.status === 409) {
          setAddedTitles((prev) => new Set(prev).add(rec.title));
        } else {
          setError(err instanceof Error ? err.message : 'Failed to add book');
        }
      }
    },
    [],
  );

  /* Dismiss a recommendation */
  const handleDismiss = useCallback((_rec: BookTrackerBookRecommendation): void => {
    // Dismissal is handled visually by the card hiding itself
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <>
      <BookTrackerHeader />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            AI Recommendations
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Personalized book suggestions powered by AI
          </p>
        </div>
        <Link
          href="/books"
          className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← Back to Library
        </Link>
      </div>

      {/* Loading check */}
      {isCheckingData && (
        <div className="flex min-h-[200px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-800 dark:border-t-zinc-200" />
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              Checking your library...
            </p>
          </div>
        </div>
      )}

      {/* Insufficient data banner */}
      {!isCheckingData && !hasEnoughData && (
        <BookTrackerInsufficientDataBanner ratedCount={ratedCount} />
      )}

      {/* Main content — user has enough data */}
      {!isCheckingData && hasEnoughData && (
        <div className="space-y-6">
          {/* Generate / Refresh controls */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <BookTrackerGenerateButton
              onClick={(): void => {
                void handleGenerate();
              }}
              isGenerating={isGenerating}
              isDisabled={isRateLimited}
              hasExistingRecommendations={recommendations.length > 0}
            />

            {/* Metadata */}
            {generatedAt && (
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                <span>
                  Generated {new Date(generatedAt).toLocaleString()} · {booksAnalyzed} books analyzed
                </span>
              </div>
            )}
          </div>

          {/* Rate limit warning */}
          {isRateLimited && (
            <div
              role="alert"
              className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300"
            >
              You&apos;ve reached today&apos;s limit (10). Try again tomorrow.
            </div>
          )}

          {/* Error */}
          {error && !isRateLimited && (
            <div
              role="alert"
              className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
            >
              <p>{error}</p>
              <button
                type="button"
                onClick={(): void => {
                  void handleGenerate();
                }}
                className="mt-2 text-sm font-medium text-red-700 underline hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Recommendations grid */}
          <BookTrackerRecommendationsList
            recommendations={recommendations}
            isLoading={isGenerating}
            addedTitles={addedTitles}
            onAddToTbr={handleAddToTbr}
            onDismiss={handleDismiss}
          />
        </div>
      )}
      </div>
    </>
  );
}
