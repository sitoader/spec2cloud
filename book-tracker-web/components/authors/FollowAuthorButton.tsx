'use client';

/**
 * Follow/unfollow author toggle button.
 */

import { useState, useCallback } from 'react';
import { bookTrackerFollowAuthor, bookTrackerUnfollowAuthor } from '@/lib/api/authors';

interface FollowAuthorButtonProps {
  authorName: string;
  isFollowing?: boolean;
  /** Use "menu" variant for compact inline-menu rendering */
  variant?: 'default' | 'menu';
  onToggle?: (following: boolean) => void;
}

export function FollowAuthorButton({
  authorName,
  isFollowing: initialFollowing = false,
  variant = 'default',
  onToggle,
}: FollowAuthorButtonProps): React.JSX.Element {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const handleToggle = useCallback(async () => {
    setLoading(true);
    try {
      if (following) {
        await bookTrackerUnfollowAuthor(authorName);
        setFollowing(false);
        onToggle?.(false);
      } else {
        await bookTrackerFollowAuthor({
          authorName,
          notificationsEnabled: true,
        });
        setFollowing(true);
        onToggle?.(true);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [authorName, following, onToggle]);

  if (variant === 'menu') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-medium transition-colors disabled:opacity-50 ${
          following
            ? 'text-green-600 hover:bg-zinc-100 dark:text-green-400 dark:hover:bg-zinc-700'
            : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700'
        }`}
      >
        {loading ? (
          <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
        ) : (
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {following ? '✓ Following Author' : 'Follow Author'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-50 ${
        following
          ? 'bg-zinc-200 text-zinc-700 hover:bg-red-100 hover:text-red-700 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-red-900/30 dark:hover:text-red-400'
          : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
      }`}
    >
      {loading ? (
        <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
      ) : following ? (
        '✓ Following'
      ) : (
        '+ Follow'
      )}
    </button>
  );
}
