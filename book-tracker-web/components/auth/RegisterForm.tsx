'use client';

/**
 * BookTracker registration panel.
 *
 * Collects email, password (with strength meter), optional display name,
 * validates everything via Zod, then delegates to the identity context.
 */

import { type FormEvent, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBookTrackerIdentity } from '@/lib/contexts/AuthContext';
import {
  bookTrackerSignupFormSchema,
  rateBookTrackerPassword,
  type BookTrackerSignupFormData,
  type BookTrackerPasswordVerdict,
} from '@/lib/validations/auth';
import { bookTrackerReadableError } from '@/lib/api/auth';

/* ------------------------------------------------------------------ */
/*  Internal strength gauge                                            */
/* ------------------------------------------------------------------ */

const GAUGE_PALETTE: Record<BookTrackerPasswordVerdict['rating'], string> = {
  fragile: 'bg-red-500',
  decent: 'bg-amber-500',
  solid: 'bg-emerald-500',
};

const GAUGE_WIDTH: Record<BookTrackerPasswordVerdict['rating'], string> = {
  fragile: 'w-1/3',
  decent: 'w-2/3',
  solid: 'w-full',
};

function StrengthGauge({ verdict }: { verdict: BookTrackerPasswordVerdict }): React.JSX.Element {
  return (
    <div className="mt-1 space-y-1" aria-live="polite">
      <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div
          className={`h-full rounded-full transition-all ${GAUGE_PALETTE[verdict.rating]} ${GAUGE_WIDTH[verdict.rating]}`}
        />
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{verdict.text}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty draft                                                        */
/* ------------------------------------------------------------------ */

type RegistrationDraft = {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
};

const BLANK_DRAFT: RegistrationDraft = {
  email: '',
  password: '',
  confirmPassword: '',
  displayName: '',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

/** Signup form for creating a new BookTracker account. */
export default function BookTrackerRegistrationPanel(): React.JSX.Element {
  const router = useRouter();
  const { performSignup } = useBookTrackerIdentity();

  const [draft, setDraft] = useState<RegistrationDraft>(BLANK_DRAFT);
  const [fieldNotes, setFieldNotes] = useState<Partial<Record<keyof BookTrackerSignupFormData, string>>>({});
  const [banner, setBanner] = useState<string>('');
  const [working, setWorking] = useState<boolean>(false);

  const passwordVerdict = rateBookTrackerPassword(draft.password);

  /* ---------- field updater ---------- */
  const patchDraft = useCallback(
    (field: keyof RegistrationDraft, value: string): void => {
      setDraft((prev) => ({ ...prev, [field]: value }));
      setFieldNotes((prev) => {
        const next = { ...prev };
        delete next[field as keyof BookTrackerSignupFormData];
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

      const parsed = bookTrackerSignupFormSchema.safeParse(draft);
      if (!parsed.success) {
        const notes: Partial<Record<keyof BookTrackerSignupFormData, string>> = {};
        for (const issue of parsed.error.issues) {
          const key = issue.path[0] as keyof BookTrackerSignupFormData | undefined;
          if (key && !notes[key]) {
            notes[key] = issue.message;
          }
        }
        setFieldNotes(notes);
        return;
      }

      setWorking(true);
      try {
        await performSignup({
          email: parsed.data.email,
          password: parsed.data.password,
          displayName: parsed.data.displayName || undefined,
        });
        router.push('/books');
      } catch (err: unknown) {
        setBanner(bookTrackerReadableError(err));
      } finally {
        setWorking(false);
      }
    },
    [draft, performSignup, router],
  );

  /* ---------- render ---------- */
  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6"
      aria-label="BookTracker registration form"
    >
      {banner && (
        <div
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
        >
          {banner}
        </div>
      )}

      {/* Identity fields */}
      <fieldset className="space-y-4" disabled={working}>
        <legend className="sr-only">Account details</legend>

        <div>
          <label htmlFor="bt-reg-email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="bt-reg-email"
            type="email"
            autoComplete="email"
            value={draft.email}
            onChange={(e): void => patchDraft('email', e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800"
            aria-invalid={!!fieldNotes.email}
            aria-describedby={fieldNotes.email ? 'bt-reg-email-err' : undefined}
          />
          {fieldNotes.email && (
            <p id="bt-reg-email-err" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {fieldNotes.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="bt-reg-display" className="mb-1 block text-sm font-medium">
            Display name <span className="text-zinc-400">(optional)</span>
          </label>
          <input
            id="bt-reg-display"
            type="text"
            autoComplete="name"
            value={draft.displayName}
            onChange={(e): void => patchDraft('displayName', e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800"
          />
        </div>
      </fieldset>

      {/* Password fields */}
      <fieldset className="space-y-4" disabled={working}>
        <legend className="sr-only">Password</legend>

        <div>
          <label htmlFor="bt-reg-password" className="mb-1 block text-sm font-medium">
            Password
          </label>
          <input
            id="bt-reg-password"
            type="password"
            autoComplete="new-password"
            value={draft.password}
            onChange={(e): void => patchDraft('password', e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800"
            aria-invalid={!!fieldNotes.password}
            aria-describedby={fieldNotes.password ? 'bt-reg-password-err' : undefined}
          />
          {fieldNotes.password && (
            <p id="bt-reg-password-err" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {fieldNotes.password}
            </p>
          )}
          {draft.password.length > 0 && <StrengthGauge verdict={passwordVerdict} />}
        </div>

        <div>
          <label htmlFor="bt-reg-confirm" className="mb-1 block text-sm font-medium">
            Confirm password
          </label>
          <input
            id="bt-reg-confirm"
            type="password"
            autoComplete="new-password"
            value={draft.confirmPassword}
            onChange={(e): void => patchDraft('confirmPassword', e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800"
            aria-invalid={!!fieldNotes.confirmPassword}
            aria-describedby={fieldNotes.confirmPassword ? 'bt-reg-confirm-err' : undefined}
          />
          {fieldNotes.confirmPassword && (
            <p id="bt-reg-confirm-err" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {fieldNotes.confirmPassword}
            </p>
          )}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={working}
        className="w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {working ? 'Creating account…' : 'Create BookTracker account'}
      </button>
    </form>
  );
}
