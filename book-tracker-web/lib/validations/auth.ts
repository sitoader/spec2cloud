/**
 * BookTracker form-level validation schemas (Zod v4).
 *
 * Every schema lives here so both client components and (future)
 * server actions share a single source of truth for field rules.
 */

import { z } from 'zod';

/* ------------------------------------------------------------------ */
/*  Password-strength evaluator                                        */
/* ------------------------------------------------------------------ */

/** Possible ratings returned by {@link rateBookTrackerPassword}. */
export type BookTrackerPasswordRating = 'fragile' | 'decent' | 'solid';

/** Result of a password strength evaluation. */
export interface BookTrackerPasswordVerdict {
  rating: BookTrackerPasswordRating;
  text: string;
}

/**
 * Evaluate the practical strength of a candidate password for
 * BookTracker accounts. The rating is intentionally coarse-grained
 * so the UI can show a simple meter without overwhelming the reader.
 */
export function rateBookTrackerPassword(input: string): BookTrackerPasswordVerdict {
  let tally = 0;

  if (input.length >= 8) tally += 1;
  if (input.length >= 12) tally += 1;
  if (/[A-Z]/.test(input)) tally += 1;
  if (/[a-z]/.test(input)) tally += 1;
  if (/\d/.test(input)) tally += 1;
  if (/[^A-Za-z0-9]/.test(input)) tally += 1;

  if (tally <= 2) {
    return { rating: 'fragile', text: 'Weak — add more variety' };
  }
  if (tally <= 4) {
    return { rating: 'decent', text: 'Fair — could be stronger' };
  }
  return { rating: 'solid', text: 'Strong password' };
}

/* ------------------------------------------------------------------ */
/*  Signup schema                                                      */
/* ------------------------------------------------------------------ */

export const bookTrackerSignupFormSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Include at least one uppercase letter')
      .regex(/[a-z]/, 'Include at least one lowercase letter')
      .regex(/\d/, 'Include at least one digit'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    displayName: z.string().optional(),
  })
  .refine((vals) => vals.password === vals.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type BookTrackerSignupFormData = z.infer<typeof bookTrackerSignupFormSchema>;

/* ------------------------------------------------------------------ */
/*  Login schema                                                       */
/* ------------------------------------------------------------------ */

export const bookTrackerLoginFormSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export type BookTrackerLoginFormData = z.infer<typeof bookTrackerLoginFormSchema>;
