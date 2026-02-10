'use client';

/**
 * BookTrackerSearchResultCard — single tile for an externally-sourced book.
 *
 * Renders cover art (with a letter-glyph fallback), metadata,
 * and quick-add action buttons that let the user shelve the book
 * directly from the search results grid.
 */

import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, BookMarked, Loader2 } from 'lucide-react';
import type { BookTrackerExternalBook } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface BookTrackerSearchResultCardProps {
  externalBook: BookTrackerExternalBook;
  onAddToLibrary: (book: BookTrackerExternalBook, shelf: 'ToRead' | 'Reading') => Promise<void>;
  onOpenDetail: (book: BookTrackerExternalBook) => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const SYNOPSIS_CAP = 120;

function abbreviateSynopsis(raw: string | undefined): string {
  if (!raw || raw.length === 0) return '';
  if (raw.length <= SYNOPSIS_CAP) return raw;
  const spaceIdx = raw.lastIndexOf(' ', SYNOPSIS_CAP);
  return raw.slice(0, spaceIdx > 0 ? spaceIdx : SYNOPSIS_CAP) + '…';
}

function coverGlyph(headline: string): string {
  const ch = headline.trim().charAt(0);
  return /^[a-zA-Z]$/.test(ch) ? ch.toUpperCase() : '📖';
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function BookTrackerSearchResultCard({
  externalBook,
  onAddToLibrary,
  onOpenDetail,
}: BookTrackerSearchResultCardProps): React.JSX.Element {
  const [addingAs, setAddingAs] = useState<'ToRead' | 'Reading' | null>(null);

  const handleAdd = useCallback(
    async (shelf: 'ToRead' | 'Reading'): Promise<void> => {
      setAddingAs(shelf);
      try {
        await onAddToLibrary(externalBook, shelf);
      } catch {
        // Parent handles error display via banner — swallow here to
        // prevent unhandled rejection from reaching error boundary.
      } finally {
        setAddingAs(null);
      }
    },
    [externalBook, onAddToLibrary],
  );

  const snippet = abbreviateSynopsis(externalBook.description);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group flex h-full flex-col overflow-hidden cursor-pointer transition-shadow duration-200 hover:shadow-lg">
        {/* Clickable cover + metadata area */}
        <button
          type="button"
          onClick={(): void => onOpenDetail(externalBook)}
          className="flex w-full flex-1 flex-col text-left outline-none"
        >
          {/* Cover image */}
          <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            {externalBook.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={externalBook.coverImageUrl}
                alt={`Cover of ${externalBook.title}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-200 to-zinc-300 text-5xl font-bold text-zinc-400 dark:from-zinc-700 dark:to-zinc-800 dark:text-zinc-500">
                {coverGlyph(externalBook.title)}
              </span>
            )}

            {/* Source badge */}
            <Badge 
              variant="secondary" 
              className="absolute left-2 top-2 text-[10px] font-medium shadow-sm"
            >
              {externalBook.source}
            </Badge>
          </div>

          {/* Text metadata */}
          <CardContent className="flex flex-1 flex-col gap-1 p-3">
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
              {externalBook.title}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {externalBook.author}
            </p>
            {externalBook.publicationYear && (
              <p className="text-[11px] text-zinc-500">
                {externalBook.publicationYear}
              </p>
            )}
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500">
              {snippet || '\u00A0'}
            </p>
            {externalBook.genres && externalBook.genres.length > 0 && (
              <div className="mt-auto flex flex-wrap gap-1 pt-1">
                {externalBook.genres.slice(0, 3).map((genre) => (
                  <Badge 
                    key={genre} 
                    variant="outline" 
                    className="text-[10px] px-1.5 py-0"
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </button>

        {/* Quick-add action bar */}
        <div className="flex gap-1 border-t p-2">
          <Button
            variant="outline"
            size="sm"
            disabled={addingAs !== null}
            onClick={(): void => { void handleAdd('ToRead'); }}
            className="flex-1 h-8 text-xs"
          >
            {addingAs === 'ToRead' ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <>
                <BookOpen className="mr-1 h-3 w-3" />
                To Read
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={addingAs !== null}
            onClick={(): void => { void handleAdd('Reading'); }}
            className="flex-1 h-8 text-xs"
          >
            {addingAs === 'Reading' ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <>
                <BookMarked className="mr-1 h-3 w-3" />
                Reading
              </>
            )}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
