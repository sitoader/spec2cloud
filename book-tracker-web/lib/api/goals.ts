/**
 * BookTracker reading goals API client.
 *
 * Provides type-safe access to the /api/reading-goals endpoints.
 */

import { apiClient, ApiError } from './client';
import type {
  BookTrackerCreateGoalPayload,
  BookTrackerReadingGoal,
  BookTrackerUpdateGoalPayload,
} from '@/types';

/**
 * Create a new reading goal.
 * @param payload - Goal details
 * @returns Created reading goal
 */
export async function bookTrackerCreateGoal(
  payload: BookTrackerCreateGoalPayload,
): Promise<BookTrackerReadingGoal> {
  return apiClient<BookTrackerReadingGoal>('/api/reading-goals', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Get the reading goal for a specific year.
 * @param year - Target year
 * @returns Reading goal data
 */
export async function bookTrackerGetGoal(
  year: number,
): Promise<BookTrackerReadingGoal> {
  return apiClient<BookTrackerReadingGoal>(`/api/reading-goals/${year}`);
}

/**
 * Update the reading goal for a specific year.
 * @param year - Target year
 * @param payload - Updated goal data
 * @returns Updated reading goal
 */
export async function bookTrackerUpdateGoal(
  year: number,
  payload: BookTrackerUpdateGoalPayload,
): Promise<BookTrackerReadingGoal> {
  return apiClient<BookTrackerReadingGoal>(`/api/reading-goals/${year}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

/**
 * Convert a caught error into a user-friendly message for goal operations.
 * @param caught - The error object
 * @returns Human-readable error message
 */
export function bookTrackerGoalReadableError(caught: unknown): string {
  if (caught instanceof ApiError) {
    if (caught.status === 401) return 'Please sign in to continue.';
    if (caught.status === 404) return 'Resource not found.';
    return caught.message || 'An unexpected error occurred.';
  }
  return 'Something went wrong. Please try again.';
}
