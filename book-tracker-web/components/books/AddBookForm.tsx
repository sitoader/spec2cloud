'use client';

/**
 * BookTrackerAddBookForm — publication submission interface.
 *
 * Orchestrates multi-field data capture for new book entries,
 * validating inputs via Zod schema and submitting to API endpoint.
 */

import { type FormEvent, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, User, Hash, Image, Calendar, Tag, ShoppingBag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { BookTrackerBookStatus } from '@/types';
import {
  bookTrackerAddBookFormSchema,
  type BookTrackerAddBookFormData,
} from '@/lib/validations/books';
import { bookTrackerAddBook, bookTrackerReadableError } from '@/lib/api/books';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
        toast.success('Book added successfully!');
        router.push(`/books/${createdBook.id}`);
      } catch (err: unknown) {
        toast.error(bookTrackerReadableError(err));
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
      <fieldset className="space-y-4" disabled={isSubmitting}>
        <legend className="sr-only">Book information</legend>

        {/* Title field */}
        <div>
          <Label htmlFor="bt-add-title">
            Title <span className="text-red-600">*</span>
          </Label>
          <div className="relative mt-1">
            <BookOpen className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              id="bt-add-title"
              type="text"
              value={draft.title}
              onChange={(e): void => updateField('title', e.target.value)}
              className="pl-10"
              aria-invalid={!!validationErrors.title}
              aria-describedby={validationErrors.title ? 'bt-add-title-err' : undefined}
            />
          </div>
          {validationErrors.title && (
            <motion.p
              id="bt-add-title-err"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-xs text-red-600 dark:text-red-400"
            >
              {validationErrors.title}
            </motion.p>
          )}
        </div>

        {/* Author field */}
        <div>
          <Label htmlFor="bt-add-author">
            Author <span className="text-red-600">*</span>
          </Label>
          <div className="relative mt-1">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              id="bt-add-author"
              type="text"
              value={draft.author}
              onChange={(e): void => updateField('author', e.target.value)}
              className="pl-10"
              aria-invalid={!!validationErrors.author}
              aria-describedby={validationErrors.author ? 'bt-add-author-err' : undefined}
            />
          </div>
          {validationErrors.author && (
            <motion.p
              id="bt-add-author-err"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-xs text-red-600 dark:text-red-400"
            >
              {validationErrors.author}
            </motion.p>
          )}
        </div>

        {/* ISBN field */}
        <div>
          <Label htmlFor="bt-add-isbn">ISBN</Label>
          <div className="relative mt-1">
            <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              id="bt-add-isbn"
              type="text"
              value={draft.isbn}
              onChange={(e): void => updateField('isbn', e.target.value)}
              placeholder="10 or 13 digits"
              className="pl-10"
              aria-invalid={!!validationErrors.isbn}
              aria-describedby={validationErrors.isbn ? 'bt-add-isbn-err' : undefined}
            />
          </div>
          {validationErrors.isbn && (
            <motion.p
              id="bt-add-isbn-err"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-xs text-red-600 dark:text-red-400"
            >
              {validationErrors.isbn}
            </motion.p>
          )}
        </div>

        {/* Cover URL field */}
        <div>
          <Label htmlFor="bt-add-cover">Cover Image URL</Label>
          <div className="relative mt-1">
            <Image className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              id="bt-add-cover"
              type="url"
              value={draft.coverImageUrl}
              onChange={(e): void => updateField('coverImageUrl', e.target.value)}
              placeholder="https://example.com/cover.jpg"
              className="pl-10"
              aria-invalid={!!validationErrors.coverImageUrl}
              aria-describedby={validationErrors.coverImageUrl ? 'bt-add-cover-err' : undefined}
            />
          </div>
          {validationErrors.coverImageUrl && (
            <motion.p
              id="bt-add-cover-err"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-xs text-red-600 dark:text-red-400"
            >
              {validationErrors.coverImageUrl}
            </motion.p>
          )}
        </div>

        {/* Description field */}
        <div>
          <Label htmlFor="bt-add-description">Description</Label>
          <Textarea
            id="bt-add-description"
            value={draft.description}
            onChange={(e): void => updateField('description', e.target.value)}
            rows={4}
            className="mt-1"
            aria-invalid={!!validationErrors.description}
            aria-describedby={validationErrors.description ? 'bt-add-description-err' : undefined}
          />
          {validationErrors.description && (
            <motion.p
              id="bt-add-description-err"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-xs text-red-600 dark:text-red-400"
            >
              {validationErrors.description}
            </motion.p>
          )}
        </div>

        {/* Genres field */}
        <div>
          <Label htmlFor="bt-add-genres">Genres</Label>
          <div className="relative mt-1">
            <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              id="bt-add-genres"
              type="text"
              value={draft.genres}
              onChange={(e): void => updateField('genres', e.target.value)}
              placeholder="Fiction, Mystery, Thriller (comma-separated)"
              className="pl-10"
              aria-describedby="bt-add-genres-hint"
            />
          </div>
          <p id="bt-add-genres-hint" className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Separate multiple genres with commas
          </p>
        </div>

        {/* Publication date field */}
        <div>
          <Label htmlFor="bt-add-pub-date">Publication Date</Label>
          <div className="relative mt-1">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              id="bt-add-pub-date"
              type="date"
              value={draft.publicationDate}
              onChange={(e): void => updateField('publicationDate', e.target.value)}
              className="pl-10"
              aria-invalid={!!validationErrors.publicationDate}
              aria-describedby={validationErrors.publicationDate ? 'bt-add-pub-date-err' : undefined}
            />
          </div>
          {validationErrors.publicationDate && (
            <motion.p
              id="bt-add-pub-date-err"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-xs text-red-600 dark:text-red-400"
            >
              {validationErrors.publicationDate}
            </motion.p>
          )}
        </div>

        {/* Status field */}
        <div>
          <Label htmlFor="bt-add-status">
            Reading Status <span className="text-red-600">*</span>
          </Label>
          <Select
            value={draft.status.toString()}
            onValueChange={(value): void => updateField('status', parseInt(value, 10) as BookTrackerBookStatus)}
          >
            <SelectTrigger id="bt-add-status" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={BookTrackerBookStatus.ToRead.toString()}>To Read</SelectItem>
              <SelectItem value={BookTrackerBookStatus.Reading.toString()}>Reading</SelectItem>
              <SelectItem value={BookTrackerBookStatus.Completed.toString()}>Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Source field */}
        <div>
          <Label htmlFor="bt-add-source">Source</Label>
          <div className="relative mt-1">
            <ShoppingBag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              id="bt-add-source"
              type="text"
              value={draft.source}
              onChange={(e): void => updateField('source', e.target.value)}
              placeholder="Library, Bookstore, Gift, etc."
              className="pl-10"
              aria-invalid={!!validationErrors.source}
              aria-describedby={validationErrors.source ? 'bt-add-source-err' : undefined}
            />
          </div>
          {validationErrors.source && (
            <motion.p
              id="bt-add-source-err"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-xs text-red-600 dark:text-red-400"
            >
              {validationErrors.source}
            </motion.p>
          )}
        </div>
      </fieldset>

      {/* Action buttons */}
      <div className="flex gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Adding Book...' : 'Add Book'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/books')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
