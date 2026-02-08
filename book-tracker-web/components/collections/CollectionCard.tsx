'use client';

/**
 * Collection card showing name, book count, and public/private indicator.
 */

import Link from 'next/link';
import type { BookTrackerCollection } from '@/types';

interface CollectionCardProps {
  collection: BookTrackerCollection;
}

export function CollectionCard({ collection }: CollectionCardProps): React.JSX.Element {
  return (
    <Link
      href={`/collections/${collection.id}`}
      className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600"
    >
      {/* Visual header */}
      <div className="mb-3 flex h-20 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-700 dark:to-zinc-800">
        <span className="text-3xl">📁</span>
      </div>

      <div className="flex-1">
        <h3 className="text-sm font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
          {collection.name}
        </h3>
        {collection.description && (
          <p className="mt-1 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
            {collection.description}
          </p>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400">
          {collection.bookCount} book{collection.bookCount !== 1 ? 's' : ''}
        </span>
        <span
          className={`inline-flex items-center gap-1 text-xs ${
            collection.isPublic
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-zinc-400 dark:text-zinc-500'
          }`}
        >
          {collection.isPublic ? '🌐 Public' : '🔒 Private'}
        </span>
      </div>
    </Link>
  );
}
