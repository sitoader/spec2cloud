/**
 * BookTracker registration route.
 *
 * Renders the signup form inside the shared auth shell.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import BookTrackerRegistrationPanel from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Create Account — BookTracker',
  description: 'Sign up for a free BookTracker account to start tracking your reading journey.',
};

export default function BookTrackerRegisterRoute(): React.JSX.Element {
  return (
    <>
      <hgroup className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Create your BookTracker account
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-200">
            Sign in
          </Link>
        </p>
      </hgroup>
      <BookTrackerRegistrationPanel />
    </>
  );
}
