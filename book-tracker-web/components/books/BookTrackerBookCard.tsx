'use client';

/**
 * Book card component for grid display.
 */

import Link from 'next/link';
import Image from 'next/image';
import BookTrackerStatusBadge from '@/components/books/BookTrackerStatusBadge';
import type { BookTrackerBook } from '@/types';

interface BookTrackerBookCardProps {
  book: BookTrackerBook;
}

function RatingStars({ score }: { score: number }): React.JSX.Element {
  return (
    <span className="text-sm" aria-label={`Rating: ${score} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < score ? 'text-amber-400' : 'text-zinc-300 dark:text-zinc-600'}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function BookTrackerBookCard({
  book,
}: BookTrackerBookCardProps): React.JSX.Element {
  return (
    <Link
      href={`/books/${book.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800 outline-none"
    >
      {/* Cover image area */}
      <div className="relative aspect-[2/3] w-full bg-zinc-100 dark:bg-zinc-700">
        {book.coverImageUrl ? (
          <Image
            src={book.coverImageUrl}
            alt={`Cover of ${book.title}`}
            className="h-full w-full object-cover"
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
            <span className="text-4xl">📚</span>
            <span className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              No cover
            </span>
          </div>
        )}
        <div className="absolute right-2 top-2">
          <BookTrackerStatusBadge status={book.status} />
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900 group-hover:text-zinc-700 dark:text-zinc-100 dark:group-hover:text-zinc-300">
          {book.title}
        </h3>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          {book.author}
        </p>
        {book.rating && (
          <div className="mt-auto pt-2">
            <RatingStars score={book.rating.score} />
          </div>
        )}
      </div>
    </Link>
  );
}
