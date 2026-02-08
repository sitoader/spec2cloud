'use client';

/**
 * BookTrackerFollowAuthorButton — toggle button for following/unfollowing an author.
 */

/* ------------------------------------------------------------------ */
/*  Interface declarations                                             */
/* ------------------------------------------------------------------ */

interface BookTrackerFollowAuthorButtonProps {
  authorName: string;
  isFollowing: boolean;
  onFollow: (authorName: string) => void;
  onUnfollow: (authorName: string) => void;
  isLoading?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function BookTrackerFollowAuthorButton({
  authorName,
  isFollowing,
  onFollow,
  onUnfollow,
  isLoading = false,
}: BookTrackerFollowAuthorButtonProps): React.JSX.Element {
  const handleClick = (): void => {
    if (isFollowing) {
      onUnfollow(authorName);
    } else {
      onFollow(authorName);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
        isFollowing
          ? 'border border-border bg-secondary text-secondary-foreground hover:bg-destructive hover:text-destructive-foreground'
          : 'bg-primary text-primary-foreground hover:bg-primary/90'
      }`}
      data-testid="follow-author-button"
    >
      {isLoading ? '…' : isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}
