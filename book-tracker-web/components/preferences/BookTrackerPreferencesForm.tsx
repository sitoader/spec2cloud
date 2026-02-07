'use client';

/**
 * BookTrackerPreferencesForm — form for configuring reading preferences.
 *
 * Provides genre checkboxes, theme tag input, and author input.
 */

import { useState, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const AVAILABLE_GENRES = [
  'Fiction',
  'Non-Fiction',
  'Science Fiction',
  'Fantasy',
  'Mystery',
  'Thriller',
  'Romance',
  'Horror',
  'Biography',
  'History',
  'Self-Help',
  'Science',
  'Technology',
  'Poetry',
  'Drama',
  'Adventure',
  'Young Adult',
  'Children',
] as const;

/* ------------------------------------------------------------------ */
/*  Interface declarations                                             */
/* ------------------------------------------------------------------ */

interface BookTrackerPreferencesFormProps {
  /** Initial preferred genres. */
  initialGenres?: string[];
  /** Initial preferred themes. */
  initialThemes?: string[];
  /** Initial favorite authors. */
  initialAuthors?: string[];
  /** Callback when the form is saved. */
  onSave: (genres: string[], themes: string[], authors: string[]) => void | Promise<void>;
  /** Whether the form is currently saving. */
  saving?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Component implementation                                           */
/* ------------------------------------------------------------------ */

export default function BookTrackerPreferencesForm({
  initialGenres = [],
  initialThemes = [],
  initialAuthors = [],
  onSave,
  saving = false,
}: BookTrackerPreferencesFormProps): React.JSX.Element {
  const [selectedGenres, setSelectedGenres] = useState<string[]>(initialGenres);
  const [themes, setThemes] = useState(initialThemes.join(', '));
  const [authors, setAuthors] = useState(initialAuthors.join(', '));

  const handleGenreToggle = useCallback((genre: string): void => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre],
    );
  }, []);

  const handleSave = useCallback((): void => {
    const parsedThemes = themes
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const parsedAuthors = authors
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    void onSave(selectedGenres, parsedThemes, parsedAuthors);
  }, [selectedGenres, themes, authors, onSave]);

  return (
    <div className="space-y-6">
      {/* Genres */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Preferred Genres
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {AVAILABLE_GENRES.map((genre) => (
            <label
              key={genre}
              className="flex items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              <input
                type="checkbox"
                checked={selectedGenres.includes(genre)}
                onChange={(): void => handleGenreToggle(genre)}
                className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-600"
              />
              <span className="text-zinc-700 dark:text-zinc-300">{genre}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Themes */}
      <div>
        <label
          htmlFor="pref-themes"
          className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-zinc-300"
        >
          Preferred Themes / Topics
        </label>
        <input
          id="pref-themes"
          type="text"
          value={themes}
          onChange={(e): void => setThemes(e.target.value)}
          placeholder="e.g. time travel, coming of age, dystopia"
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Separate multiple themes with commas
        </p>
      </div>

      {/* Authors */}
      <div>
        <label
          htmlFor="pref-authors"
          className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-zinc-300"
        >
          Favorite Authors
        </label>
        <input
          id="pref-authors"
          type="text"
          value={authors}
          onChange={(e): void => setAuthors(e.target.value)}
          placeholder="e.g. Brandon Sanderson, Ursula K. Le Guin"
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Separate multiple authors with commas
        </p>
      </div>

      {/* Save button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {saving ? 'Saving…' : 'Save Preferences'}
      </button>
    </div>
  );
}
