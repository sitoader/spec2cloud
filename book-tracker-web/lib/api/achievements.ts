/**
 * BookTracker achievements API client.
 *
 * Provides type-safe access to the /api/achievements endpoints.
 */

import { apiClient, ApiError } from './client';
import type {
  BookTrackerAchievement,
  BookTrackerUserAchievement,
} from '@/types';

/**
 * List all available achievement definitions.
 * @returns Array of achievements
 */
export async function bookTrackerListAchievements(): Promise<BookTrackerAchievement[]> {
  return apiClient<BookTrackerAchievement[]>('/api/achievements');
}

/**
 * List achievements earned by the current user.
 * @returns Array of user achievements
 */
export async function bookTrackerListUserAchievements(): Promise<BookTrackerUserAchievement[]> {
  return apiClient<BookTrackerUserAchievement[]>('/api/achievements/me');
}

/**
 * Convert a caught error into a user-friendly message for achievement operations.
 * @param caught - The error object
 * @returns Human-readable error message
 */
export function bookTrackerAchievementReadableError(caught: unknown): string {
  if (caught instanceof ApiError) {
    if (caught.status === 401) return 'Please sign in to continue.';
    if (caught.status === 404) return 'Resource not found.';
    return caught.message || 'An unexpected error occurred.';
  }
  return 'Something went wrong. Please try again.';
}
