'use client';

/**
 * Manual book entry form for BookTracker.
 */

import { type FormEvent, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { bookTrackerAddBook, bookTrackerBookReadableError } from '@/lib/api/books';
import {
  bookTrackerAddBookSchema,
  type BookTrackerAddBookFormData,
} from '@/lib/validations/books';
import type { BookTrackerBookStatus } from '@/types';

/* ------------------------------------------------------------------ */
/*  Draft type                                                         */
/* ------------------------------------------------------------------ */

type AddBookDraft = {
  title: string;
  author: string;
  isbn: string;
  coverImageUrl: string;
  description: string;
  genres: string;
  publicationDate: string;
  status: BookTrackerBookStatus;
  source: string;
};

const BLANK_DRAFT: AddBookDraft = {
  title: '',
  author: '',
  isbn: '',
  coverImageUrl: '',
  description: '',
  genres: '',
  publicationDate: '',
  status: 'ToRead',
  source: '',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function BookTrackerAddBookForm(): React.JSX.Element {
  const router = useRouter();
  const [draft, setDraft] = useState<AddBookDraft>(BLANK_DRAFT);
  const [fieldNotes, setFieldNotes] = useState<Partial<Record<keyof BookTrackerAddBookFormData, string>>>({});
  const [banner, setBanner] = useState('');
  const [working, setWorking] = useState(false);

  const patchDraft = useCallback(
    (field: keyof AddBookDraft, value: string): void => {
      setDraft((prev) => ({ ...prev, [field]: value }));
      setFieldNotes((prev) => {
        const next = { ...prev };
        delete next[field as keyof BookTrackerAddBookFormData];
        return next;
      });
    },
    [],
  );

  const handleSubmit = useCallback(
    async (evt: FormEvent<HTMLFormElement>): Promise<void> => {
      evt.preventDefault();
      setBanner('');
      setFieldNotes({});

      const parsed = bookTrackerAddBookSchema.safeParse(draft);
      if (!parsed.success) {
        const notes: Partial<Record<keyof BookTrackerAddBookFormData, string>> = {};
        for (const issue of parsed.error.issues) {
          const key = issue.path[0] as keyof BookTrackerAddBookFormData | undefined;
          if (key && !notes[key]) {
            notes[key] = issue.message;
          }
        }
        setFieldNotes(notes);
        return;
      }

      setWorking(true);
      try {
        const genresArray = parsed.data.genres
          ? parsed.data.genres.split(',').map((g) => g.trim()).filter(Boolean)
          : undefined;

        const book = await bookTrackerAddBook({
          title: parsed.data.title,
          author: parsed.data.author,
          isbn: parsed.data.isbn || undefined,
          coverImageUrl: parsed.data.coverImageUrl || undefined,
          description: parsed.data.description || undefined,
          genres: genresArray,
          publicationDate: parsed.data.publicationDate || undefined,
          status: parsed.data.status,
          source: parsed.data.source || undefined,
        });
        router.push(`/books/${book.id}`);
      } catch (err: unknown) {
        setBanner(bookTrackerBookReadableError(err));
      } finally {
        setWorking(false);
      }
    },
    [draft, router],
  );

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6"
      aria-label="Add a book to your library"
    >
      {banner && (
        <div
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
        >
          {banner}
        </div>
      )}

      <fieldset className="space-y-4" disabled={working}>
        <legend className="sr-only">Book details</legend>

        {/* Title */}
        <div>
          <label htmlFor="bt-book-title" className="mb-1 block text-sm font-medium">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="bt-book-title"
            type="text"
            value={draft.title}
            onChange={(e): void => patchDraft('title', e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800"
            aria-invalid={!!fieldNotes.title}
            aria-describedby={fieldNotes.title ? 'bt-book-title-err' : undefined}
          />
          {fieldNotes.title && (
            <p id="bt-book-title-err" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {fieldNotes.title}
            </p>
          )}
        </div>

        {/* Author */}
        <div>
          <label htmlFor="bt-book-author" className="mb-1 block text-sm font-medium">
            Author <span className="text-red-500">*</span>
          </label>
          <input
            id="bt-book-author"
            type="text"
            value={draft.author}
            onChange={(e): void => patchDraft('author', e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800"
            aria-invalid={!!fieldNotes.author}
            aria-describedby={fieldNotes.author ? 'bt-book-author-err' : undefined}
          />
          {fieldNotes.author && (
            <p id="bt-book-author-err" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {fieldNotes.author}
            </p>
          )}
        </div>

        {/* ISBN */}
        <div>
          <label htmlFor="bt-book-isbn" className="mb-1 block text-sm font-medium">
            ISBN <span className="text-zinc-400">(optional)</span>
          </label>
          <input
            id="bt-book-isbn"
            type="text"
            value={draft.isbn}
            onChange={(e): void => patchDraft('isbn', e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800"
          />
        </div>

        {/* Cover Image URL */}
        <div>
          <label htmlFor="bt-book-cover" className="mb-1 block text-sm font-medium">
            Cover image URL <span className="text-zinc-400">(optional)</span>
          </label>
          <input
            id="bt-book-cover"
            type="url"
            value={draft.coverImageUrl}
            onChange={(e): void => patchDraft('coverImageUrl', e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="bt-book-desc" className="mb-1 block text-sm font-medium">
            Description <span className="text-zinc-400">(optional)</span>
          </label>
          <textarea
            id="bt-book-desc"
            rows={4}
            value={draft.description}
            onChange={(e): void => patchDraft('description', e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800"
          />
        </div>

        {/* Genres */}
        <div>
          <label htmlFor="bt-book-genres" className="mb-1 block text-sm font-medium">
            Genres <span className="text-zinc-400">(comma-separated, optional)</span>
          </label>
          <input
            id="bt-book-genres"
            type="text"
            placeholder="e.g. Fiction, Fantasy, Adventure"
            value={draft.genres}
            onChange={(e): void => patchDraft('genres', e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800"
          />
        </div>

        {/* Publication Date */}
        <div>
          <label htmlFor="bt-book-pubdate" className="mb-1 block text-sm font-medium">
            Publication date <span className="text-zinc-400">(optional)</span>
          </label>
          <input
            id="bt-book-pubdate"
            type="date"
            value={draft.publicationDate}
            onChange={(e): void => patchDraft('publicationDate', e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800"
          />
        </div>

        {/* Status */}
        <div>
          <label htmlFor="bt-book-status" className="mb-1 block text-sm font-medium">
            Reading status
          </label>
          <select
            id="bt-book-status"
            value={draft.status}
            onChange={(e): void => patchDraft('status', e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800"
          >
            <option value="ToRead">To Read</option>
            <option value="Reading">Reading</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Source */}
        <div>
          <label htmlFor="bt-book-source" className="mb-1 block text-sm font-medium">
            Source <span className="text-zinc-400">(optional)</span>
          </label>
          <input
            id="bt-book-source"
            type="text"
            placeholder="e.g. Recommendation, Bookstore"
            value={draft.source}
            onChange={(e): void => patchDraft('source', e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800"
          />
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={working}
        className="w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {working ? 'Adding book…' : 'Add to library'}
      </button>
    </form>
  );
}
