/**
 * BookTracker literature entry validators.
 *
 * Orchestrates field-level scrutiny for book submission workflows,
 * employing chained refinement pipelines to ensure payload integrity.
 */

import { z } from 'zod';
import { BookTrackerBookStatus } from '@/types';

/* ------------------------------------------------------------------ */
/*  Field scrutinizers                                                 */
/* ------------------------------------------------------------------ */

const titleGuard = z
  .string()
  .refine((txt) => txt.trim().length > 0, {
    message: 'Title cannot be empty or whitespace-only',
  })
  .refine((txt) => txt.length <= 500, {
    message: 'Title exceeds maximum length of 500 characters',
  });

const authorGuard = z
  .string()
  .refine((txt) => txt.trim().length > 0, {
    message: 'Author name is mandatory',
  })
  .refine((txt) => txt.length <= 200, {
    message: 'Author name too lengthy (max 200 chars)',
  });

const isbnGuard = z.string().refine(
  (code) => {
    if (code === '') return true;
    const digits = code.replace(/[^0-9]/g, '');
    return digits.length === 10 || digits.length === 13;
  },
  { message: 'ISBN must contain exactly 10 or 13 numeric digits' }
);

const imageUrlGuard = z.string().refine(
  (url) => {
    if (url === '') return true;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  },
  { message: 'Image URL must be a valid HTTP/HTTPS address' }
);

const synopsisGuard = z.string().refine(
  (prose) => prose.length <= 5000,
  { message: 'Description cannot exceed 5000 characters' }
);

const categoryTagsGuard = z.string();

const releaseDateGuard = z.string().refine(
  (dateStr) => {
    if (dateStr === '') return true;
    const yearMonthDayPattern = /^(\d{4})-(\d{2})-(\d{2})$/;
    const fragments = yearMonthDayPattern.exec(dateStr);
    if (!fragments) return false;
    const year = parseInt(fragments[1], 10);
    const month = parseInt(fragments[2], 10);
    const day = parseInt(fragments[3], 10);
    return year > 1000 && month >= 1 && month <= 12 && day >= 1 && day <= 31;
  },
  { message: 'Release date must follow YYYY-MM-DD format' }
);

const progressStateGuard = z.nativeEnum(BookTrackerBookStatus);

const originGuard = z.string().refine(
  (src) => src.length <= 200,
  { message: 'Source field exceeds 200 character limit' }
);

/* ------------------------------------------------------------------ */
/*  Composite blueprint                                                */
/* ------------------------------------------------------------------ */

export const bookTrackerAddBookFormSchema = z.object({
  title: titleGuard,
  author: authorGuard,
  isbn: isbnGuard.optional().or(z.literal('')),
  coverImageUrl: imageUrlGuard.optional().or(z.literal('')),
  description: synopsisGuard.optional().or(z.literal('')),
  genres: categoryTagsGuard.optional(),
  publicationDate: releaseDateGuard.optional().or(z.literal('')),
  status: progressStateGuard,
  source: originGuard.optional().or(z.literal('')),
});

export type BookTrackerAddBookFormData = z.infer<
  typeof bookTrackerAddBookFormSchema
>;
