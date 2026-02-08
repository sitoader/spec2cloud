'use client';

/**
 * BookTracker collections page.
 *
 * Displays user's book collections with the ability to create new ones.
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type { BookTrackerCollection } from '@/types';
import {
  bookTrackerGetCollections,
  bookTrackerCreateCollection,
  bookTrackerCollectionsReadableError,
} from '@/lib/api/collections';
import { BookTrackerCollectionCard } from '@/components/collections/CollectionCard';
import { BookTrackerHeader } from '@/components/layout/Header';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CollectionsPage(): React.JSX.Element {
  const [collections, setCollections] = useState<BookTrackerCollection[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const loadCollections = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const data = await bookTrackerGetCollections();
      setCollections(data);
    } catch (caught) {
      setError(bookTrackerCollectionsReadableError(caught));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCollections();
  }, [loadCollections]);

  const handleCreate = async (): Promise<void> => {
    if (!name.trim()) return;
    try {
      await bookTrackerCreateCollection({ name, description, isPublic });
      setName('');
      setDescription('');
      setIsPublic(false);
      setShowForm(false);
      void loadCollections();
    } catch (caught) {
      setError(bookTrackerCollectionsReadableError(caught));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <BookTrackerHeader />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">My Collections</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={(): void => { setShowForm(!showForm); }}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {showForm ? 'Cancel' : '+ New Collection'}
            </button>
            <Link href="/" className="text-sm text-primary hover:underline">
              ← Back
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {showForm && (
          <div className="mb-6 rounded-lg border border-border bg-card p-4">
            <h2 className="mb-3 text-lg font-semibold">Create Collection</h2>
            <div className="space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e): void => { setName(e.target.value); }}
                placeholder="Collection name"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <textarea
                value={description}
                onChange={(e): void => { setDescription(e.target.value); }}
                placeholder="Description (optional)"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                rows={2}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e): void => { setIsPublic(e.target.checked); }}
                />
                Public collection
              </label>
              <button
                onClick={(): void => { void handleCreate(); }}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Create
              </button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}

        {!isLoading && collections.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <p className="text-lg">No collections yet</p>
            <p className="mt-1 text-sm">Create your first collection to organize your books.</p>
          </div>
        )}

        {!isLoading && collections.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {collections.map((collection) => (
              <BookTrackerCollectionCard
                key={collection.id}
                collection={collection}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
