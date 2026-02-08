'use client';

/**
 * Collection detail page — view and manage books in a collection.
 */

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BookTrackerHeader } from '@/components/layout/Header';
import type { BookTrackerCollection } from '@/types';
import {
  bookTrackerGetCollection,
  bookTrackerDeleteCollection,
} from '@/lib/api/collections';

export default function CollectionDetailPage(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const collectionId = params.id as string;

  const [collection, setCollection] = useState<BookTrackerCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bookTrackerGetCollection(collectionId);
      setCollection(data);
    } catch {
      setError('Failed to load collection');
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async () => {
    if (!confirm('Delete this collection?')) return;
    try {
      await bookTrackerDeleteCollection(collectionId);
      router.push('/collections');
    } catch {
      setError('Failed to delete collection');
    }
  };

  return (
    <>
      <BookTrackerHeader />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {loading && (
          <div className="flex h-48 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-zinc-200" />
          </div>
        )}

        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}

        {collection && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {collection.name}
                </h1>
                {collection.description && (
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {collection.description}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
                  <span>{collection.bookCount} books</span>
                  <span>{collection.isPublic ? '🌐 Public' : '🔒 Private'}</span>
                  <span>
                    Created{' '}
                    {new Date(collection.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => router.push('/collections')}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-700"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                >
                  Delete
                </button>
              </div>
            </div>

            {collection.bookCount === 0 && (
              <div className="rounded-xl border border-dashed border-zinc-300 py-12 text-center dark:border-zinc-600">
                <span className="text-3xl">📚</span>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  This collection is empty. Add books from the library!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
