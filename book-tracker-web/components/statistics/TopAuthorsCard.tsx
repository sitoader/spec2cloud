'use client';

/**
 * Top authors list with book counts.
 */

import type { BookTrackerAuthorReadCount } from '@/types';

interface TopAuthorsCardProps {
  data: BookTrackerAuthorReadCount[];
}

export function TopAuthorsCard({ data }: TopAuthorsCardProps): React.JSX.Element {
  if (data.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-zinc-400 dark:text-zinc-500">
        No author data yet
      </p>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <div className="space-y-3">
      {data.slice(0, 10).map((author, idx) => (
        <div key={author.author} className="flex items-center gap-3">
          <span className="w-5 text-right text-xs font-bold text-zinc-400 dark:text-zinc-500">
            {idx + 1}
          </span>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {author.author}
              </span>
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                {author.count} book{author.count !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-700">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${(author.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
