'use client';

/**
 * BookTracker followed authors page.
 *
 * Displays followed authors and allows following/unfollowing.
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type { BookTrackerFollowedAuthor } from '@/types';
import {
  bookTrackerGetFollowedAuthors,
  bookTrackerFollowAuthor,
  bookTrackerUnfollowAuthor,
  bookTrackerAuthorsReadableError,
} from '@/lib/api/authors';
import { BookTrackerFollowedAuthorsList } from '@/components/authors/FollowedAuthorsList';
import { BookTrackerHeader } from '@/components/layout/Header';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function FollowingPage(): React.JSX.Element {
  const [authors, setAuthors] = useState<BookTrackerFollowedAuthor[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [newAuthor, setNewAuthor] = useState('');

  const loadAuthors = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const data = await bookTrackerGetFollowedAuthors();
      setAuthors(data);
    } catch (caught) {
      setError(bookTrackerAuthorsReadableError(caught));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAuthors();
  }, [loadAuthors]);

  const handleFollow = async (): Promise<void> => {
    if (!newAuthor.trim()) return;
    try {
      setActionLoading(true);
      await bookTrackerFollowAuthor({ authorName: newAuthor.trim(), notificationsEnabled: true });
      setNewAuthor('');
      void loadAuthors();
    } catch (caught) {
      setError(bookTrackerAuthorsReadableError(caught));
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnfollow = async (authorName: string): Promise<void> => {
    try {
      setActionLoading(true);
      await bookTrackerUnfollowAuthor(authorName);
      void loadAuthors();
    } catch (caught) {
      setError(bookTrackerAuthorsReadableError(caught));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <BookTrackerHeader />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Followed Authors</h1>
          <Link href="/" className="text-sm text-primary hover:underline">
            ← Back
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="mb-6 flex gap-2">
          <input
            type="text"
            value={newAuthor}
            onChange={(e): void => { setNewAuthor(e.target.value); }}
            placeholder="Enter author name to follow"
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
            onKeyDown={(e): void => {
              if (e.key === 'Enter') { void handleFollow(); }
            }}
          />
          <button
            onClick={(): void => { void handleFollow(); }}
            disabled={actionLoading || !newAuthor.trim()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Follow
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}

        {!isLoading && (
          <BookTrackerFollowedAuthorsList
            authors={authors}
            onUnfollow={(name): void => { void handleUnfollow(name); }}
            isLoading={actionLoading}
          />
        )}
      </main>
    </div>
  );
}
