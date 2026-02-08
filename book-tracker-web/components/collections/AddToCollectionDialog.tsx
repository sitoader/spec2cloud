'use client';

/**
 * Dialog for adding a book to a collection.
 */

import { useState, useEffect, useCallback } from 'react';
import type { BookTrackerCollection } from '@/types';
import { bookTrackerListCollections, bookTrackerAddBookToCollection } from '@/lib/api/collections';

interface AddToCollectionDialogProps {
  bookId: string;
  open: boolean;
  onClose: () => void;
}

export function AddToCollectionDialog({
  bookId,
  open,
  onClose,
}: AddToCollectionDialogProps): React.JSX.Element | null {
  const [collections, setCollections] = useState<BookTrackerCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      try {
        const data = await bookTrackerListCollections();
        setCollections(data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  const handleAdd = useCallback(
    async (collectionId: string) => {
      setAdding(collectionId);
      try {
        await bookTrackerAddBookToCollection(collectionId, { bookId });
        setAddedIds((prev) => new Set(prev).add(collectionId));
      } catch {
        // silent - could already be in collection
      } finally {
        setAdding(null);
      }
    },
    [bookId],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Add to Collection
        </h2>

        {loading ? (
          <div className="mt-4 flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-zinc-200" />
          </div>
        ) : collections.length === 0 ? (
          <p className="mt-4 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            No collections yet. Create one first!
          </p>
        ) : (
          <div className="mt-3 max-h-64 space-y-1 overflow-y-auto">
            {collections.map((col) => (
              <div
                key={col.id}
                className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
              >
                <div className="flex-1 truncate">
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {col.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {col.bookCount} books
                  </p>
                </div>
                {addedIds.has(col.id) ? (
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    ✓ Added
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAdd(col.id)}
                    disabled={adding === col.id}
                    className="rounded-md bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-200 disabled:opacity-50 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
                  >
                    {adding === col.id ? '...' : 'Add'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-800 dark:text-zinc-400"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
