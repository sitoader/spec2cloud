/**
 * BookTracker login route.
 *
 * Renders the sign-in form inside the shared auth shell.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import BookTrackerSignInPanel from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In — BookTracker',
  description: 'Log in to your BookTracker account to access your personal reading library.',
};

export default function BookTrackerLoginRoute(): React.JSX.Element {
  return (
    <>
      <hgroup className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Sign in to BookTracker
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          New here?{' '}
          <Link href="/register" className="font-medium text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-200">
            Create an account
          </Link>
        </p>
      </hgroup>
      <BookTrackerSignInPanel />
    </>
  );
}
