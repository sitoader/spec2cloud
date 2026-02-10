'use client';

/**
 * Collection detail page — view and manage books in a collection.
 */

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookTrackerHeader } from '@/components/layout/Header';
import type { BookTrackerCollectionDetail } from '@/types';
import {
  bookTrackerGetCollection,
  bookTrackerDeleteCollection,
  bookTrackerRemoveBookFromCollection,
} from '@/lib/api/collections';
import { toast } from 'sonner';

export default function CollectionDetailPage(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const collectionId = params.id as string;

  const [collection, setCollection] = useState<BookTrackerCollectionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
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
      toast.success('Collection deleted');
      router.push('/books');
    } catch {
      toast.error('Failed to delete collection');
    }
  };

  const handleRemoveBook = async (bookId: string) => {
    try {
      await bookTrackerRemoveBookFromCollection(collectionId, bookId);
      // Update local state
      setCollection((prev) => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          books: prev.books.filter((b) => b.bookId !== bookId),
          bookCount: prev.bookCount - 1,
        };
        return updated;
      });
      toast.success('Book removed from collection');
    } catch {
      toast.error('Failed to remove book');
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

        {error && !loading && (
          <div className="space-y-4">
            <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
              {error}
            </div>
            <button
              type="button"
              onClick={() => router.push('/books')}
              className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              ← Back to Library
            </button>
          </div>
        )}

        {collection && (
          <div className="space-y-6">
            {/* Header */}
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
                  <span>{collection.bookCount} book{collection.bookCount !== 1 ? 's' : ''}</span>
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
                  onClick={() => router.push('/books')}
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

            {/* Books list */}
            {collection.books.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-300 py-12 text-center dark:border-zinc-600">
                <span className="text-3xl">📚</span>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  This collection is empty. Add books from the library!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {collection.books.map((book) => (
                  <div
                    key={book.bookId}
                    className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-white p-3 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-800/80"
                  >
                    {/* Cover */}
                    <Link href={`/books/${book.bookId}`} className="flex-shrink-0">
                      {book.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={book.coverImageUrl}
                          alt={book.title}
                          className="h-16 w-11 rounded border border-zinc-200 object-cover dark:border-zinc-700"
                        />
                      ) : (
                        <div className="flex h-16 w-11 items-center justify-center rounded border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-700">
                          <span className="text-lg font-bold text-zinc-400 dark:text-zinc-500">
                            {book.title.charAt(0)}
                          </span>
                        </div>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/books/${book.bookId}`}
                        className="block truncate text-sm font-medium text-zinc-900 hover:text-blue-600 dark:text-zinc-100 dark:hover:text-blue-400"
                      >
                        {book.title}
                      </Link>
                      <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                        {book.author}
                      </p>
                      {book.notes && (
                        <p className="mt-0.5 truncate text-xs italic text-zinc-400 dark:text-zinc-500">
                          {book.notes}
                        </p>
                      )}
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveBook(book.bookId)}
                      className="flex-shrink-0 rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                      title="Remove from collection"
                    >
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
