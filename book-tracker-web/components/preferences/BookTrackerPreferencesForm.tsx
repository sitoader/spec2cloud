'use client';

/**
 * BookTrackerPreferencesForm — form for configuring reading preferences.
 *
 * Provides genre checkboxes, theme tag input, and author input.
 */

import { useState, useCallback } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const FICTION_GENRES = [
  'Fiction',
  'Science Fiction',
  'Fantasy',
  'Mystery',
  'Thriller',
  'Romance',
  'Horror',
  'Drama',
  'Adventure',
  'Young Adult',
  'Children',
] as const;

const NONFICTION_GENRES = [
  'Non-Fiction',
  'Biography',
  'History',
  'Self-Help',
  'Science',
  'Technology',
] as const;

const OTHER_GENRES = [
  'Poetry',
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
        <h3 className="mb-3 text-sm font-semibold">
          Preferred Genres
        </h3>
        <Tabs defaultValue="fiction" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="fiction">Fiction</TabsTrigger>
            <TabsTrigger value="nonfiction">Non-Fiction</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>
          
          <TabsContent value="fiction" className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {FICTION_GENRES.map((genre) => (
                <div key={genre} className="flex items-center space-x-2">
                  <Checkbox
                    id={`genre-${genre}`}
                    checked={selectedGenres.includes(genre)}
                    onCheckedChange={(): void => handleGenreToggle(genre)}
                  />
                  <Label 
                    htmlFor={`genre-${genre}`}
                    className="cursor-pointer text-sm font-normal"
                  >
                    {genre}
                  </Label>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="nonfiction" className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {NONFICTION_GENRES.map((genre) => (
                <div key={genre} className="flex items-center space-x-2">
                  <Checkbox
                    id={`genre-${genre}`}
                    checked={selectedGenres.includes(genre)}
                    onCheckedChange={(): void => handleGenreToggle(genre)}
                  />
                  <Label 
                    htmlFor={`genre-${genre}`}
                    className="cursor-pointer text-sm font-normal"
                  >
                    {genre}
                  </Label>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="other" className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {OTHER_GENRES.map((genre) => (
                <div key={genre} className="flex items-center space-x-2">
                  <Checkbox
                    id={`genre-${genre}`}
                    checked={selectedGenres.includes(genre)}
                    onCheckedChange={(): void => handleGenreToggle(genre)}
                  />
                  <Label 
                    htmlFor={`genre-${genre}`}
                    className="cursor-pointer text-sm font-normal"
                  >
                    {genre}
                  </Label>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Separator />

      {/* Themes */}
      <div className="space-y-2">
        <Label htmlFor="pref-themes" className="text-sm font-semibold">
          Preferred Themes / Topics
        </Label>
        <Input
          id="pref-themes"
          type="text"
          value={themes}
          onChange={(e): void => setThemes(e.target.value)}
          placeholder="e.g. time travel, coming of age, dystopia"
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Separate multiple themes with commas
        </p>
      </div>

      <Separator />

      {/* Authors */}
      <div className="space-y-2">
        <Label htmlFor="pref-authors" className="text-sm font-semibold">
          Favorite Authors
        </Label>
        <Input
          id="pref-authors"
          type="text"
          value={authors}
          onChange={(e): void => setAuthors(e.target.value)}
          placeholder="e.g. Brandon Sanderson, Ursula K. Le Guin"
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Separate multiple authors with commas
        </p>
      </div>

      {/* Save button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
