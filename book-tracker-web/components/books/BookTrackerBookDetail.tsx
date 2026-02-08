'use client';

/**
 * Full book detail display with edit/delete actions.
 */

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import BookTrackerStatusBadge from '@/components/books/BookTrackerStatusBadge';
import BookTrackerConfirmDialog from '@/components/books/BookTrackerConfirmDialog';
import { bookTrackerDeleteBook, bookTrackerUpdateBookStatus, bookTrackerReadableError } from '@/lib/api/books';
import type { BookTrackerBook } from '@/types';
import { BookTrackerBookStatus } from '@/types';

interface BookTrackerBookDetailProps {
  book: BookTrackerBook;
}

const STATUS_OPTIONS: { value: BookTrackerBookStatus; label: string }[] = [
  { value: BookTrackerBookStatus.ToRead, label: 'To Read' },
  { value: BookTrackerBookStatus.Reading, label: 'Reading' },
  { value: BookTrackerBookStatus.Completed, label: 'Completed' },
];

export default function BookTrackerBookDetail({
  book: initialBook,
}: BookTrackerBookDetailProps): React.JSX.Element {
  const router = useRouter();
  const [book, setBook] = useState<BookTrackerBook>(initialBook);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [banner, setBanner] = useState('');

  const handleStatusChange = useCallback(
    async (newStatus: BookTrackerBookStatus): Promise<void> => {
      if (newStatus === book.status) return;
      try {
        const updated = await bookTrackerUpdateBookStatus(book.id, newStatus);
        setBook(updated);
      } catch (err: unknown) {
        setBanner(bookTrackerReadableError(err));
      }
    },
    [book.id, book.status],
  );

  const handleDelete = useCallback(async (): Promise<void> => {
    setDeleting(true);
    try {
      await bookTrackerDeleteBook(book.id);
      router.push('/books');
    } catch (err: unknown) {
      setBanner(bookTrackerReadableError(err));
      setDeleting(false);
      setConfirmOpen(false);
    }
  }, [book.id, router]);

  return (
    <div className="space-y-6">
      {banner && (
        <div
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
        >
          {banner}
        </div>
      )}

      <div className="flex flex-col gap-6 sm:flex-row">
        {/* Cover */}
        <div className="w-full shrink-0 sm:w-48">
          <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-zinc-100 shadow-md dark:bg-zinc-700">
            {book.coverImageUrl ? (
              <Image
                src={book.coverImageUrl}
                alt={`Cover of ${book.title}`}
                className="h-full w-full object-cover"
                fill
                sizes="192px"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center">
                <span className="text-5xl">📚</span>
                <span className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  No cover
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {book.title}
            </h1>
            <p className="mt-1 text-lg text-zinc-600 dark:text-zinc-400">
              {book.author}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <BookTrackerStatusBadge status={book.status} />
            {book.rating && (
              <span className="text-sm text-amber-500" aria-label={`Rating: ${book.rating.score} out of 5`}>
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i}>{i < (book.rating?.score ?? 0) ? '★' : '☆'}</span>
                ))}
              </span>
            )}
          </div>

          {book.description && (
            <p className="text-sm text-zinc-700 dark:text-zinc-300">{book.description}</p>
          )}

          {/* Metadata grid */}
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {book.isbn && (
              <>
                <dt className="font-medium text-zinc-500 dark:text-zinc-400">ISBN</dt>
                <dd className="text-zinc-900 dark:text-zinc-100">{book.isbn}</dd>
              </>
            )}
            {book.publicationDate && (
              <>
                <dt className="font-medium text-zinc-500 dark:text-zinc-400">Published</dt>
                <dd className="text-zinc-900 dark:text-zinc-100">
                  {new Date(book.publicationDate).toLocaleDateString()}
                </dd>
              </>
            )}
            {book.genres && book.genres.length > 0 && (
              <>
                <dt className="font-medium text-zinc-500 dark:text-zinc-400">Genres</dt>
                <dd className="text-zinc-900 dark:text-zinc-100">{book.genres.join(', ')}</dd>
              </>
            )}
            {book.source && (
              <>
                <dt className="font-medium text-zinc-500 dark:text-zinc-400">Source</dt>
                <dd className="text-zinc-900 dark:text-zinc-100">{book.source}</dd>
              </>
            )}
            <dt className="font-medium text-zinc-500 dark:text-zinc-400">Added</dt>
            <dd className="text-zinc-900 dark:text-zinc-100">
              {new Date(book.addedDate).toLocaleDateString()}
            </dd>
          </dl>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-700">
        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Status:</span>
          <select
            value={book.status}
            onChange={(e): void => {
              void handleStatusChange(Number(e.target.value) as BookTrackerBookStatus);
            }}
            className="rounded-md border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            aria-label="Change book status"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={(): void => setConfirmOpen(true)}
          disabled={deleting}
          className="rounded-md border border-red-300 px-4 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
        >
          {deleting ? 'Deleting…' : 'Delete book'}
        </button>
      </div>

      <BookTrackerConfirmDialog
        open={confirmOpen}
        title="Delete book"
        message={`Are you sure you want to remove "${book.title}" from your library? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Keep"
        onConfirm={(): void => {
          void handleDelete();
        }}
        onCancel={(): void => setConfirmOpen(false)}
      />
    </div>
  );
}
