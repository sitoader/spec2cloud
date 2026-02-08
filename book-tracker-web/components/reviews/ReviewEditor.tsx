'use client';

/**
 * Review editor supporting text, tags, mood, and recommendation.
 */

import { useState, useCallback } from 'react';
import type { BookTrackerBookReview, BookTrackerCreateReviewPayload } from '@/types';
import { bookTrackerCreateReview, bookTrackerUpdateReview } from '@/lib/api/reviews';

interface ReviewEditorProps {
  bookId: string;
  existingReview?: BookTrackerBookReview;
  onSaved?: (review: BookTrackerBookReview) => void;
  onCancel?: () => void;
}

const MOOD_OPTIONS = [
  'joyful', 'contemplative', 'inspired', 'emotional',
  'thrilling', 'relaxing', 'intense', 'humorous',
];

const SUGGESTED_TAGS = [
  'page-turner', 'slow-burn', 'thought-provoking', 'inspiring',
  'emotional', 'educational', 'easy-read', 'complex',
  'well-written', 'unpredictable', 'classic', 'must-read',
];

export function ReviewEditor({
  bookId,
  existingReview,
  onSaved,
  onCancel,
}: ReviewEditorProps): React.JSX.Element {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [text, setText] = useState(existingReview?.reviewText ?? '');
  const [tags, setTags] = useState<string[]>(existingReview?.tags ?? []);
  const [mood, setMood] = useState(existingReview?.mood ?? '');
  const [wouldRecommend, setWouldRecommend] = useState(existingReview?.wouldRecommend ?? true);
  const [isPublic, setIsPublic] = useState(existingReview?.isPublic ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSubmit = useCallback(async () => {
    if (rating < 1) {
      setError('Please select a rating');
      return;
    }
    setSaving(true);
    setError('');
    try {
      let review: BookTrackerBookReview;
      if (existingReview) {
        review = await bookTrackerUpdateReview(existingReview.id, {
          rating,
          reviewText: text || undefined,
          isPublic,
          tags: tags.length > 0 ? tags : undefined,
          mood: mood || undefined,
          wouldRecommend,
        });
      } else {
        const payload: BookTrackerCreateReviewPayload = {
          bookId,
          rating,
          reviewText: text || undefined,
          isPublic,
          tags: tags.length > 0 ? tags : undefined,
          mood: mood || undefined,
          wouldRecommend,
        };
        review = await bookTrackerCreateReview(payload);
      }
      onSaved?.(review);
    } catch {
      setError('Failed to save review');
    } finally {
      setSaving(false);
    }
  }, [bookId, rating, text, tags, mood, wouldRecommend, isPublic, existingReview, onSaved]);

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Star rating */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Rating
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-2xl transition-colors ${
                star <= rating
                  ? 'text-amber-400'
                  : 'text-zinc-300 hover:text-amber-300 dark:text-zinc-600'
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      {/* Review text */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Review
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share your thoughts about this book..."
          rows={4}
          className="w-full resize-none rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
        />
      </div>

      {/* Mood */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Mood
        </label>
        <div className="flex flex-wrap gap-1.5">
          {MOOD_OPTIONS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMood(mood === m ? '' : m)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                mood === m
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-400'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Tags
        </label>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                tags.includes(tag)
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-400'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Options row */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={wouldRecommend}
            onChange={(e) => setWouldRecommend(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300"
          />
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            Would recommend
          </span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300"
          />
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            Make public
          </span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-800 dark:text-zinc-400"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving || rating < 1}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : existingReview ? 'Update Review' : 'Submit Review'}
        </button>
      </div>
    </div>
  );
}
