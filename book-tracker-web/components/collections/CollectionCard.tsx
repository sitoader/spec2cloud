'use client';

/**
 * BookTrackerCollectionCard — displays a collection summary card.
 *
 * Shows collection name, description, book count, and visibility status.
 */

import type { BookTrackerCollection } from '@/types';

/* ------------------------------------------------------------------ */
/*  Interface declarations                                             */
/* ------------------------------------------------------------------ */

interface BookTrackerCollectionCardProps {
  collection: BookTrackerCollection;
  onClick?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function BookTrackerCollectionCard({
  collection,
  onClick,
}: BookTrackerCollectionCardProps): React.JSX.Element {
  return (
    <div
      className="cursor-pointer rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md"
      onClick={onClick}
      onKeyDown={(e): void => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      role="button"
      tabIndex={0}
      data-testid="collection-card"
    >
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-foreground">{collection.name}</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            collection.isPublic
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          {collection.isPublic ? 'Public' : 'Private'}
        </span>
      </div>
      {collection.description && (
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {collection.description}
        </p>
      )}
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <span>📚 {collection.bookCount} book{collection.bookCount !== 1 ? 's' : ''}</span>
        <span>·</span>
        <span>Updated {new Date(collection.updatedAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
