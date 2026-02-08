'use client';

/**
 * BookTrackerFollowedAuthorsList — displays a list of followed authors.
 */

import type { BookTrackerFollowedAuthor } from '@/types';
import { BookTrackerFollowAuthorButton } from './FollowAuthorButton';

/* ------------------------------------------------------------------ */
/*  Interface declarations                                             */
/* ------------------------------------------------------------------ */

interface BookTrackerFollowedAuthorsListProps {
  authors: BookTrackerFollowedAuthor[];
  onUnfollow: (authorName: string) => void;
  isLoading?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function BookTrackerFollowedAuthorsList({
  authors,
  onUnfollow,
  isLoading = false,
}: BookTrackerFollowedAuthorsListProps): React.JSX.Element {
  if (authors.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground" data-testid="followed-authors-empty">
        <p>You are not following any authors yet.</p>
        <p className="mt-1 text-sm">Follow authors to stay updated on new releases.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="followed-authors-list">
      {authors.map((author) => (
        <div
          key={author.id}
          className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
        >
          <div>
            <p className="font-medium text-foreground">{author.authorName}</p>
            <p className="text-xs text-muted-foreground">
              Following since {new Date(author.followedAt).toLocaleDateString()}
              {author.notificationsEnabled && ' · 🔔 Notifications on'}
            </p>
          </div>
          <BookTrackerFollowAuthorButton
            authorName={author.authorName}
            isFollowing={true}
            onFollow={(): void => { /* no-op for following */ }}
            onUnfollow={onUnfollow}
            isLoading={isLoading}
          />
        </div>
      ))}
    </div>
  );
}
