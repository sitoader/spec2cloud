'use client';

/**
 * BookTracker sign-in panel.
 *
 * Collects email + password, validates via Zod, and delegates
 * authentication to the identity context.
 */

import { type FormEvent, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBookTrackerIdentity } from '@/lib/contexts/AuthContext';
import {
  bookTrackerLoginFormSchema,
  type BookTrackerLoginFormData,
} from '@/lib/validations/auth';
import { bookTrackerReadableError } from '@/lib/api/auth';

/* ------------------------------------------------------------------ */
/*  Draft type                                                         */
/* ------------------------------------------------------------------ */

type SignInDraft = {
  email: string;
  password: string;
  rememberMe: boolean;
};

const BLANK_SIGNIN_DRAFT: SignInDraft = {
  email: '',
  password: '',
  rememberMe: false,
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

/** Login form for existing BookTracker users. */
export default function BookTrackerSignInPanel(): React.JSX.Element {
  const router = useRouter();
  const { performLogin } = useBookTrackerIdentity();

  const [draft, setDraft] = useState<SignInDraft>(BLANK_SIGNIN_DRAFT);
  const [fieldNotes, setFieldNotes] = useState<Partial<Record<keyof BookTrackerLoginFormData, string>>>({});
  const [banner, setBanner] = useState<string>('');
  const [working, setWorking] = useState<boolean>(false);

  /* ---------- field updater ---------- */
  const patchDraft = useCallback(
    (field: keyof SignInDraft, value: string | boolean): void => {
      setDraft((prev) => ({ ...prev, [field]: value }));
      setFieldNotes((prev) => {
        const next = { ...prev };
        delete next[field as keyof BookTrackerLoginFormData];
        return next;
      });
    },
    [],
  );

  /* ---------- submit handler ---------- */
  const handleSubmit = useCallback(
    async (evt: FormEvent<HTMLFormElement>): Promise<void> => {
      evt.preventDefault();
      setBanner('');
      setFieldNotes({});

      const parsed = bookTrackerLoginFormSchema.safeParse(draft);
      if (!parsed.success) {
        const notes: Partial<Record<keyof BookTrackerLoginFormData, string>> = {};
        for (const issue of parsed.error.issues) {
          const key = issue.path[0] as keyof BookTrackerLoginFormData | undefined;
          if (key && !notes[key]) {
            notes[key] = issue.message;
          }
        }
        setFieldNotes(notes);
        return;
      }

      setWorking(true);
      try {
        await performLogin({
          email: parsed.data.email,
          password: parsed.data.password,
          rememberMe: parsed.data.rememberMe,
        });
        router.push('/library');
      } catch (err: unknown) {
        setBanner(bookTrackerReadableError(err));
      } finally {
        setWorking(false);
      }
    },
    [draft, performLogin, router],
  );

  /* ---------- render ---------- */
  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6"
      aria-label="BookTracker sign-in form"
    >
      {banner && (
        <div
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
        >
          {banner}
        </div>
      )}

      <fieldset className="space-y-4" disabled={working}>
        <legend className="sr-only">Sign-in credentials</legend>

        <div>
          <label htmlFor="bt-login-email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="bt-login-email"
            type="email"
            autoComplete="email"
            value={draft.email}
            onChange={(e): void => patchDraft('email', e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800"
            aria-invalid={!!fieldNotes.email}
            aria-describedby={fieldNotes.email ? 'bt-login-email-err' : undefined}
          />
          {fieldNotes.email && (
            <p id="bt-login-email-err" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {fieldNotes.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="bt-login-password" className="mb-1 block text-sm font-medium">
            Password
          </label>
          <input
            id="bt-login-password"
            type="password"
            autoComplete="current-password"
            value={draft.password}
            onChange={(e): void => patchDraft('password', e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800"
            aria-invalid={!!fieldNotes.password}
            aria-describedby={fieldNotes.password ? 'bt-login-password-err' : undefined}
          />
          {fieldNotes.password && (
            <p id="bt-login-password-err" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {fieldNotes.password}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <input
              id="bt-login-remember"
              type="checkbox"
              checked={draft.rememberMe}
              onChange={(e): void => patchDraft('rememberMe', e.target.checked)}
              className="rounded border-zinc-300 dark:border-zinc-600"
            />
            Remember me
          </label>

          <Link
            href="/forgot-password"
            className="text-sm text-zinc-500 underline-offset-2 hover:underline dark:text-zinc-400"
          >
            Forgot password?
          </Link>
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={working}
        className="w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {working ? 'Signing in…' : 'Sign in to BookTracker'}
      </button>
    </form>
  );
}
