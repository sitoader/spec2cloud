/**
 * BookTracker book-form validation schemas (Zod v4).
 */

import { z } from 'zod';

/* ------------------------------------------------------------------ */
/*  Add-book schema                                                    */
/* ------------------------------------------------------------------ */

export const bookTrackerAddBookSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(500, 'Title must be 500 characters or fewer'),
  author: z
    .string()
    .min(1, 'Author is required')
    .max(200, 'Author must be 200 characters or fewer'),
  isbn: z
    .string()
    .max(20, 'ISBN must be 20 characters or fewer')
    .optional()
    .or(z.literal('')),
  coverImageUrl: z
    .string()
    .max(500, 'URL must be 500 characters or fewer')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .max(2000, 'Description must be 2000 characters or fewer')
    .optional()
    .or(z.literal('')),
  genres: z.string().optional(),
  publicationDate: z.string().optional().or(z.literal('')),
  status: z.enum(['ToRead', 'Reading', 'Completed']),
  source: z.string().optional().or(z.literal('')),
});

export type BookTrackerAddBookFormData = z.infer<typeof bookTrackerAddBookSchema>;
