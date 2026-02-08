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
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useBookTrackerIdentity } from '@/lib/contexts/AuthContext';
import {
  bookTrackerLoginFormSchema,
  type BookTrackerLoginFormData,
} from '@/lib/validations/auth';
import { bookTrackerReadableError } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
        router.push('/books');
      } catch (err: unknown) {
        toast.error(bookTrackerReadableError(err));
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
      <fieldset className="space-y-4" disabled={working}>
        <legend className="sr-only">Sign-in credentials</legend>

        <div>
          <Label htmlFor="bt-login-email">Email</Label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              id="bt-login-email"
              type="email"
              autoComplete="email"
              value={draft.email}
              onChange={(e): void => patchDraft('email', e.target.value)}
              className="pl-10"
              aria-invalid={!!fieldNotes.email}
              aria-describedby={fieldNotes.email ? 'bt-login-email-err' : undefined}
            />
          </div>
          {fieldNotes.email && (
            <motion.p
              id="bt-login-email-err"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-xs text-red-600 dark:text-red-400"
            >
              {fieldNotes.email}
            </motion.p>
          )}
        </div>

        <div>
          <Label htmlFor="bt-login-password">Password</Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              id="bt-login-password"
              type="password"
              autoComplete="current-password"
              value={draft.password}
              onChange={(e): void => patchDraft('password', e.target.value)}
              className="pl-10"
              aria-invalid={!!fieldNotes.password}
              aria-describedby={fieldNotes.password ? 'bt-login-password-err' : undefined}
            />
          </div>
          {fieldNotes.password && (
            <motion.p
              id="bt-login-password-err"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-xs text-red-600 dark:text-red-400"
            >
              {fieldNotes.password}
            </motion.p>
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

      <Button type="submit" disabled={working} className="w-full">
        {working && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {working ? 'Signing in…' : 'Sign in to BookTracker'}
      </Button>
    </form>
  );
}
