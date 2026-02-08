'use client';

/**
 * List of followed authors with notification toggles.
 */

import { useEffect, useState } from 'react';
import type { BookTrackerFollowedAuthor } from '@/types';
import { bookTrackerListFollowedAuthors, bookTrackerUnfollowAuthor } from '@/lib/api/authors';

export function FollowedAuthorsList(): React.JSX.Element {
  const [authors, setAuthors] = useState<BookTrackerFollowedAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await bookTrackerListFollowedAuthors();
        setAuthors(data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleUnfollow = async (authorName: string) => {
    try {
      await bookTrackerUnfollowAuthor(authorName);
      setAuthors((prev) => prev.filter((a) => a.authorName !== authorName));
    } catch {
      // silent
    }
  };

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-zinc-200" />
      </div>
    );
  }

  if (authors.length === 0) {
    return (
      <div className="py-12 text-center">
        <span className="text-4xl">✍️</span>
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
          You&apos;re not following any authors yet.
        </p>
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          Follow authors from book detail pages to get updates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {authors.map((author) => (
        <div
          key={author.id}
          className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-sm font-bold text-white">
              {author.authorName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {author.authorName}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Following since{' '}
                {new Date(author.followedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
                {author.notificationsEnabled && ' · 🔔 Notifications on'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleUnfollow(author.authorName)}
            className="rounded-md px-3 py-1 text-xs font-medium text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
          >
            Unfollow
          </button>
        </div>
      ))}
    </div>
  );
}
