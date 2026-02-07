/**
 * BookTracker preferences API client.
 *
 * Provides type-safe access to the /api/preferences endpoints.
 */

import { apiClient } from './client';
import type {
  BookTrackerUserPreferences,
  BookTrackerUpdatePreferencesPayload,
} from '@/types';

/**
 * Fetch the current user's reading preferences.
 * @returns User preferences
 */
export async function bookTrackerGetPreferences(): Promise<BookTrackerUserPreferences> {
  return apiClient<BookTrackerUserPreferences>('/api/preferences');
}

/**
 * Update the current user's reading preferences.
 * @param data - Updated preferences
 * @returns Updated preferences
 */
export async function bookTrackerUpdatePreferences(
  data: BookTrackerUpdatePreferencesPayload,
): Promise<BookTrackerUserPreferences> {
  return apiClient<BookTrackerUserPreferences>('/api/preferences', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
