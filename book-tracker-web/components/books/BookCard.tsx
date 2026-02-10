'use client';

/**
 * BookTrackerBookCard — publication tile assembler.
 *
 * Orchestrates book visualization through a multi-phase construction
 * pipeline, synthesizing display elements via functional composition.
 */

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { BookTrackerBook } from '@/types';
import { BookTrackerStatusBadge } from './StatusBadge';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/* ------------------------------------------------------------------ */
/*  Interface declarations                                             */
/* ------------------------------------------------------------------ */

interface BookTrackerBookCardProps {
  publication: BookTrackerBook;
}

type RenderPipeline = {
  symbolGlyph: string;
  authorCredit: string;
  synopsisSnippet: string;
  categoryTags: string[];
  imageExists: boolean;
};

/* ------------------------------------------------------------------ */
/*  Pipeline builders                                                  */
/* ------------------------------------------------------------------ */

const buildSymbolGlyph = (headline: string): string => {
  const sanitized = headline.trim();
  if (sanitized.length === 0) return '?';
  
  // Check if first character is a letter (A-Z or a-z)
  const firstChar = sanitized[0];
  const isLetter = /^[a-zA-Z]$/.test(firstChar);
  
  return isLetter ? firstChar.toUpperCase() : '📖';
};

const buildSynopsisSnippet = (fullDescription: string | undefined, charCap: number): string => {
  if (!fullDescription || fullDescription.length === 0) return '';
  if (fullDescription.length <= charCap) return fullDescription;
  
  let boundary = charCap;
  while (boundary > 0 && fullDescription[boundary] !== ' ') {
    boundary--;
  }
  
  const cutPoint = boundary > 0 ? boundary : charCap;
  return fullDescription.substring(0, cutPoint) + '…';
};

const constructRenderPipeline = (pub: BookTrackerBook): RenderPipeline => {
  return {
    symbolGlyph: buildSymbolGlyph(pub.title),
    authorCredit: `By ${pub.author}`,
    synopsisSnippet: buildSynopsisSnippet(pub.description, 140),
    categoryTags: pub.genres?.slice(0, 3) || [],
    imageExists: Boolean(pub.coverImageUrl && pub.coverImageUrl.length > 0),
  };
};

/* ------------------------------------------------------------------ */
/*  Component implementation                                           */
/* ------------------------------------------------------------------ */

export function BookTrackerBookCard({
  publication,
}: BookTrackerBookCardProps): React.JSX.Element {
  const pipeline = useMemo(
    () => constructRenderPipeline(publication),
    [publication]
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="group relative flex h-full flex-col"
      aria-labelledby={`bt-book-title-${publication.id}`}
    >
      <Card className="flex h-full flex-col overflow-hidden transition-shadow duration-200 hover:shadow-xl">
        <Link
          href={`/books/${publication.id}`}
          className="flex h-full flex-col outline-none"
        >
        <div className="relative aspect-[2/3] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {publication.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={publication.coverImageUrl}
              alt={`Cover for ${publication.title}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800">
              <span className="text-6xl font-bold text-zinc-400 dark:text-zinc-600">
                {pipeline.symbolGlyph}
              </span>
            </div>
          )}
          <div className="absolute right-2 top-2">
            <BookTrackerStatusBadge status={publication.status} />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3
            id={`bt-book-title-${publication.id}`}
            className="min-h-[2.75rem] line-clamp-2 text-base font-semibold leading-snug text-zinc-900 dark:text-zinc-100"
          >
            {publication.title}
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {pipeline.authorCredit}
          </p>

          <p className="min-h-[2.5rem] line-clamp-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-500">
            {pipeline.synopsisSnippet || '\u00A0'}
          </p>

          {pipeline.categoryTags.length > 0 && (
            <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
              {pipeline.categoryTags.map((tag, idx) => (
                <Badge key={`${tag}-${idx}`} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Link>
      </Card>
    </motion.article>
  );
}
