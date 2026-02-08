/**
 * BookTracker goals & achievements API client.
 *
 * Provides type-safe access to reading goals and achievements endpoints.
 */

import { apiClient, ApiError } from './client';
import type {
  BookTrackerReadingGoal,
  BookTrackerSetGoalPayload,
  BookTrackerAchievement,
  BookTrackerUserAchievement,
} from '@/types';

/**
 * Set or update a reading goal.
 */
export async function bookTrackerSetGoal(
  payload: BookTrackerSetGoalPayload,
): Promise<BookTrackerReadingGoal> {
  return apiClient<BookTrackerReadingGoal>('/api/reading-goals', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Get a reading goal for a specific year.
 */
export async function bookTrackerGetGoal(
  year: number,
): Promise<BookTrackerReadingGoal> {
  return apiClient<BookTrackerReadingGoal>(`/api/reading-goals/${year}`);
}

/**
 * Get all available achievements.
 */
export async function bookTrackerGetAchievements(): Promise<BookTrackerAchievement[]> {
  return apiClient<BookTrackerAchievement[]>('/api/achievements');
}

/**
 * Get user's unlocked achievements.
 */
export async function bookTrackerGetUserAchievements(): Promise<BookTrackerUserAchievement[]> {
  return apiClient<BookTrackerUserAchievement[]>('/api/achievements/user');
}

/**
 * Maps API errors to user-friendly messages.
 */
export function bookTrackerGoalsReadableError(caught: unknown): string {
  if (caught instanceof ApiError) {
    if (caught.status === 404) return 'Goal not found.';
    if (caught.status === 401) return 'Please sign in.';
  }
  return 'Something went wrong. Please try again.';
}
