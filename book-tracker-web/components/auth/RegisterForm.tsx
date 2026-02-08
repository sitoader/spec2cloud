'use client';

/**
 * BookTracker registration panel.
 *
 * Collects email, password (with strength meter), optional display name,
 * validates everything via Zod, then delegates to the identity context.
 */

import { type FormEvent, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useBookTrackerIdentity } from '@/lib/contexts/AuthContext';
import {
  bookTrackerSignupFormSchema,
  rateBookTrackerPassword,
  type BookTrackerSignupFormData,
  type BookTrackerPasswordVerdict,
} from '@/lib/validations/auth';
import { bookTrackerReadableError } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
        toast.success('Account created successfully! Welcome to BookTracker.');
        router.push('/books');
      } catch (err: unknown) {
        toast.error(bookTrackerReadableError(err));
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
      {/* Identity fields */}
      <fieldset className="space-y-4" disabled={working}>
        <legend className="sr-only">Account details</legend>

        <div>
          <Label htmlFor="bt-reg-email">Email</Label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              id="bt-reg-email"
              type="email"
              autoComplete="email"
              value={draft.email}
              onChange={(e): void => patchDraft('email', e.target.value)}
              className="pl-10"
              aria-invalid={!!fieldNotes.email}
              aria-describedby={fieldNotes.email ? 'bt-reg-email-err' : undefined}
            />
          </div>
          {fieldNotes.email && (
            <motion.p
              id="bt-reg-email-err"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-xs text-red-600 dark:text-red-400"
            >
              {fieldNotes.email}
            </motion.p>
          )}
        </div>

        <div>
          <Label htmlFor="bt-reg-display">
            Display name <span className="text-zinc-400">(optional)</span>
          </Label>
          <div className="relative mt-1">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              id="bt-reg-display"
              type="text"
              autoComplete="name"
              value={draft.displayName}
              onChange={(e): void => patchDraft('displayName', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </fieldset>

      {/* Password fields */}
      <fieldset className="space-y-4" disabled={working}>
        <legend className="sr-only">Password</legend>

        <div>
          <Label htmlFor="bt-reg-password">Password</Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              id="bt-reg-password"
              type="password"
              autoComplete="new-password"
              value={draft.password}
              onChange={(e): void => patchDraft('password', e.target.value)}
              className="pl-10"
              aria-invalid={!!fieldNotes.password}
              aria-describedby={fieldNotes.password ? 'bt-reg-password-err' : undefined}
            />
          </div>
          {fieldNotes.password && (
            <motion.p
              id="bt-reg-password-err"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-xs text-red-600 dark:text-red-400"
            >
              {fieldNotes.password}
            </motion.p>
          )}
          {draft.password.length > 0 && <StrengthGauge verdict={passwordVerdict} />}
        </div>

        <div>
          <Label htmlFor="bt-reg-confirm">Confirm password</Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              id="bt-reg-confirm"
              type="password"
              autoComplete="new-password"
              value={draft.confirmPassword}
              onChange={(e): void => patchDraft('confirmPassword', e.target.value)}
              className="pl-10"
              aria-invalid={!!fieldNotes.confirmPassword}
              aria-describedby={fieldNotes.confirmPassword ? 'bt-reg-confirm-err' : undefined}
            />
          </div>
          {fieldNotes.confirmPassword && (
            <motion.p
              id="bt-reg-confirm-err"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-xs text-red-600 dark:text-red-400"
            >
              {fieldNotes.confirmPassword}
            </motion.p>
          )}
        </div>
      </fieldset>

      <Button type="submit" disabled={working} className="w-full">
        {working && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {working ? 'Creating account…' : 'Create BookTracker account'}
      </Button>
    </form>
  );
}
