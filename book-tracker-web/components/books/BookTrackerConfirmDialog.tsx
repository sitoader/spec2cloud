'use client';

/**
 * Reusable confirmation modal for BookTracker.
 */

import { useCallback, useEffect, useRef } from 'react';

interface BookTrackerConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function BookTrackerConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: BookTrackerConfirmDialogProps): React.JSX.Element | null {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;

    if (open && !el.open) {
      el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDialogElement>): void => {
      if (e.key === 'Escape') {
        onCancel();
      }
    },
    [onCancel],
  );

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 m-auto max-w-md rounded-lg bg-white p-0 shadow-xl backdrop:bg-black/50 dark:bg-zinc-800"
      aria-labelledby="bt-confirm-title"
      aria-describedby="bt-confirm-message"
    >
      <div className="p-6">
        <h2
          id="bt-confirm-title"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
        >
          {title}
        </h2>
        <p
          id="bt-confirm-message"
          className="mt-2 text-sm text-zinc-600 dark:text-zinc-400"
        >
          {message}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
