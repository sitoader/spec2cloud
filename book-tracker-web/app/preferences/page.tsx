'use client';

/**
 * BookTracker preferences page.
 *
 * Allows the user to configure reading preferences, view
 * rating summary, and manage their profile settings.
 */

import { useEffect, useState, useCallback } from 'react';
import BookTrackerPreferencesForm from '@/components/preferences/BookTrackerPreferencesForm';
import BookTrackerRatingSummary from '@/components/preferences/BookTrackerRatingSummary';
import {
  bookTrackerGetPreferences,
  bookTrackerUpdatePreferences,
} from '@/lib/api/preferences';
import { bookTrackerGetBooks } from '@/lib/api/books';
import type {
  BookTrackerUserPreferences,
  BookTrackerBook,
} from '@/types';
import { BookTrackerHeader } from '@/components/layout/Header';

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function BookTrackerPreferencesPage(): React.JSX.Element {
  const [preferences, setPreferences] = useState<BookTrackerUserPreferences | null>(null);
  const [books, setBooks] = useState<BookTrackerBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      const [prefsData, booksData] = await Promise.all([
        bookTrackerGetPreferences(),
        bookTrackerGetBooks(undefined, 1, 100),
      ]);
      setPreferences(prefsData);
      setBooks(booksData.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleSave = useCallback(
    async (genres: string[], themes: string[], authors: string[]): Promise<void> => {
      setSaving(true);
      setError('');
      setSuccess('');
      try {
        const updated = await bookTrackerUpdatePreferences({
          preferredGenres: genres,
          preferredThemes: themes,
          favoriteAuthors: authors,
        });
        setPreferences(updated);
        setSuccess('Preferences saved successfully!');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save preferences');
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  return (
    <>
      <BookTrackerHeader />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Reading Preferences
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Configure your reading preferences to get better book recommendations.
      </p>

      {/* Loading state */}
      {loading && (
        <div className="mt-8 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-800 dark:border-t-zinc-200" />
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div
          role="alert"
          className="mt-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
        >
          {error}
        </div>
      )}

      {/* Success banner */}
      {success && (
        <div
          role="status"
          className="mt-4 rounded-md border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
        >
          {success}
        </div>
      )}

      {!loading && (
        <div className="mt-8 space-y-8">
          {/* Rating summary */}
          <BookTrackerRatingSummary books={books} />

          {/* Preferences form */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Your Preferences
            </h2>
            <BookTrackerPreferencesForm
              initialGenres={preferences?.preferredGenres ?? []}
              initialThemes={preferences?.preferredThemes ?? []}
              initialAuthors={preferences?.favoriteAuthors ?? []}
              onSave={handleSave}
              saving={saving}
            />
          </div>
        </div>
      )}
      </div>
    </>
  );
}
