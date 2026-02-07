'use client';

/**
 * BookTrackerAddBookForm — publication submission interface.
 *
 * Orchestrates multi-field data capture for new book entries,
 * validating inputs via Zod schema and submitting to API endpoint.
 */

import { type FormEvent, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookTrackerBookStatus } from '@/types';
import {
  bookTrackerAddBookFormSchema,
  type BookTrackerAddBookFormData,
} from '@/lib/validations/books';
import { bookTrackerAddBook } from '@/lib/api/books';

/* ------------------------------------------------------------------ */
/*  Form state blueprint                                               */
/* ------------------------------------------------------------------ */

type FormDraft = {
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

const INITIAL_DRAFT: FormDraft = {
  title: '',
  author: '',
  isbn: '',
  coverImageUrl: '',
  description: '',
  genres: '',
  publicationDate: '',
  status: BookTrackerBookStatus.ToRead,
  source: '',
};

/* ------------------------------------------------------------------ */
/*  Component implementation                                           */
/* ------------------------------------------------------------------ */

export function BookTrackerAddBookForm(): React.JSX.Element {
  const router = useRouter();
  const [draft, setDraft] = useState<FormDraft>(INITIAL_DRAFT);
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof BookTrackerAddBookFormData, string>>>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const updateField = useCallback(
    (fieldName: keyof FormDraft, newValue: string | BookTrackerBookStatus): void => {
      setDraft((prev) => ({ ...prev, [fieldName]: newValue }));
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName as keyof BookTrackerAddBookFormData];
        return next;
      });
    },
    []
  );

  const handleSubmission = useCallback(
    async (evt: FormEvent<HTMLFormElement>): Promise<void> => {
      evt.preventDefault();
      setSubmitError('');
      setValidationErrors({});

      const validation = bookTrackerAddBookFormSchema.safeParse(draft);
      if (!validation.success) {
        const errors: Partial<Record<keyof BookTrackerAddBookFormData, string>> = {};
        for (const issue of validation.error.issues) {
          const fieldKey = issue.path[0] as keyof BookTrackerAddBookFormData | undefined;
          if (fieldKey && !errors[fieldKey]) {
            errors[fieldKey] = issue.message;
          }
        }
        setValidationErrors(errors);
        return;
      }

      setIsSubmitting(true);
      try {
        const genresArray = draft.genres
          ? draft.genres.split(',').map((g) => g.trim()).filter((g) => g.length > 0)
          : undefined;

        const payload = {
          title: validation.data.title,
          author: validation.data.author,
          isbn: validation.data.isbn || undefined,
          coverImageUrl: validation.data.coverImageUrl || undefined,
          description: validation.data.description || undefined,
          genres: genresArray,
          publicationDate: validation.data.publicationDate || undefined,
          status: validation.data.status,
          source: validation.data.source || undefined,
        };

        const createdBook = await bookTrackerAddBook(payload);
        router.push(`/books/${createdBook.id}`);
      } catch (err: unknown) {
        setSubmitError(err instanceof Error ? err.message : 'Failed to add book');
      } finally {
        setIsSubmitting(false);
      }
    },
    [draft, router]
  );

  return (
    <form
      onSubmit={handleSubmission}
      noValidate
      className="space-y-6"
      aria-label="Add new book form"
    >
      {submitError && (
        <div
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
        >
          {submitError}
        </div>
      )}

      <fieldset className="space-y-4" disabled={isSubmitting}>
        <legend className="sr-only">Book information</legend>

        {/* Title field */}
        <div>
          <label htmlFor="bt-add-title" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Title <span className="text-red-600">*</span>
          </label>
          <input
            id="bt-add-title"
            type="text"
            value={draft.title}
            onChange={(e): void => updateField('title', e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            aria-invalid={!!validationErrors.title}
            aria-describedby={validationErrors.title ? 'bt-add-title-err' : undefined}
          />
          {validationErrors.title && (
            <p id="bt-add-title-err" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {validationErrors.title}
            </p>
          )}
        </div>

        {/* Author field */}
        <div>
          <label htmlFor="bt-add-author" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Author <span className="text-red-600">*</span>
          </label>
          <input
            id="bt-add-author"
            type="text"
            value={draft.author}
            onChange={(e): void => updateField('author', e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            aria-invalid={!!validationErrors.author}
            aria-describedby={validationErrors.author ? 'bt-add-author-err' : undefined}
          />
          {validationErrors.author && (
            <p id="bt-add-author-err" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {validationErrors.author}
            </p>
          )}
        </div>

        {/* ISBN field */}
        <div>
          <label htmlFor="bt-add-isbn" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            ISBN
          </label>
          <input
            id="bt-add-isbn"
            type="text"
            value={draft.isbn}
            onChange={(e): void => updateField('isbn', e.target.value)}
            placeholder="10 or 13 digits"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            aria-invalid={!!validationErrors.isbn}
            aria-describedby={validationErrors.isbn ? 'bt-add-isbn-err' : undefined}
          />
          {validationErrors.isbn && (
            <p id="bt-add-isbn-err" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {validationErrors.isbn}
            </p>
          )}
        </div>

        {/* Cover URL field */}
        <div>
          <label htmlFor="bt-add-cover" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Cover Image URL
          </label>
          <input
            id="bt-add-cover"
            type="url"
            value={draft.coverImageUrl}
            onChange={(e): void => updateField('coverImageUrl', e.target.value)}
            placeholder="https://example.com/cover.jpg"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            aria-invalid={!!validationErrors.coverImageUrl}
            aria-describedby={validationErrors.coverImageUrl ? 'bt-add-cover-err' : undefined}
          />
          {validationErrors.coverImageUrl && (
            <p id="bt-add-cover-err" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {validationErrors.coverImageUrl}
            </p>
          )}
        </div>

        {/* Description field */}
        <div>
          <label htmlFor="bt-add-description" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Description
          </label>
          <textarea
            id="bt-add-description"
            value={draft.description}
            onChange={(e): void => updateField('description', e.target.value)}
            rows={4}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            aria-invalid={!!validationErrors.description}
            aria-describedby={validationErrors.description ? 'bt-add-description-err' : undefined}
          />
          {validationErrors.description && (
            <p id="bt-add-description-err" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {validationErrors.description}
            </p>
          )}
        </div>

        {/* Genres field */}
        <div>
          <label htmlFor="bt-add-genres" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Genres
          </label>
          <input
            id="bt-add-genres"
            type="text"
            value={draft.genres}
            onChange={(e): void => updateField('genres', e.target.value)}
            placeholder="Fiction, Mystery, Thriller (comma-separated)"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            aria-describedby="bt-add-genres-hint"
          />
          <p id="bt-add-genres-hint" className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Separate multiple genres with commas
          </p>
        </div>

        {/* Publication date field */}
        <div>
          <label htmlFor="bt-add-pub-date" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Publication Date
          </label>
          <input
            id="bt-add-pub-date"
            type="date"
            value={draft.publicationDate}
            onChange={(e): void => updateField('publicationDate', e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            aria-invalid={!!validationErrors.publicationDate}
            aria-describedby={validationErrors.publicationDate ? 'bt-add-pub-date-err' : undefined}
          />
          {validationErrors.publicationDate && (
            <p id="bt-add-pub-date-err" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {validationErrors.publicationDate}
            </p>
          )}
        </div>

        {/* Status field */}
        <div>
          <label htmlFor="bt-add-status" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Reading Status <span className="text-red-600">*</span>
          </label>
          <select
            id="bt-add-status"
            value={draft.status}
            onChange={(e): void => updateField('status', parseInt(e.target.value, 10) as BookTrackerBookStatus)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          >
            <option value={BookTrackerBookStatus.ToRead}>To Read</option>
            <option value={BookTrackerBookStatus.Reading}>Reading</option>
            <option value={BookTrackerBookStatus.Completed}>Completed</option>
          </select>
        </div>

        {/* Source field */}
        <div>
          <label htmlFor="bt-add-source" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Source
          </label>
          <input
            id="bt-add-source"
            type="text"
            value={draft.source}
            onChange={(e): void => updateField('source', e.target.value)}
            placeholder="Library, Bookstore, Gift, etc."
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            aria-invalid={!!validationErrors.source}
            aria-describedby={validationErrors.source ? 'bt-add-source-err' : undefined}
          />
          {validationErrors.source && (
            <p id="bt-add-source-err" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {validationErrors.source}
            </p>
          )}
        </div>
      </fieldset>

      {/* Action buttons */}
      <div className="flex gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {isSubmitting ? 'Adding Book...' : 'Add Book'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/books')}
          disabled={isSubmitting}
          className="rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
