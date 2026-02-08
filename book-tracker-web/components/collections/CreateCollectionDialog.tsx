'use client';

/**
 * Dialog for creating a new collection.
 */

import { useState, useCallback } from 'react';
import type { BookTrackerCollection } from '@/types';
import { bookTrackerCreateCollection } from '@/lib/api/collections';

interface CreateCollectionDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (collection: BookTrackerCollection) => void;
}

export function CreateCollectionDialog({
  open,
  onClose,
  onCreated,
}: CreateCollectionDialogProps): React.JSX.Element | null {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = useCallback(async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError('');
    try {
      const created = await bookTrackerCreateCollection({
        name: name.trim(),
        description: description.trim() || undefined,
        isPublic,
      });
      onCreated?.(created);
      setName('');
      setDescription('');
      setIsPublic(false);
      onClose();
    } catch {
      setError('Failed to create collection');
    } finally {
      setSaving(false);
    }
  }, [name, description, isPublic, onCreated, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          New Collection
        </h2>

        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Reading List"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this collection about?"
              rows={2}
              className="w-full resize-none rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300"
            />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Make this collection public
            </span>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-800 dark:text-zinc-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={saving || !name.trim()}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
