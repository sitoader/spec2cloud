/**
 * BookTracker authentication shell.
 *
 * Shared layout for /login and /register routes — renders
 * a compact navigation strip and centres the form card.
 */

import Link from 'next/link';
import type { ReactNode } from 'react';

/* ------------------------------------------------------------------ */
/*  Navigation                                                         */
/* ------------------------------------------------------------------ */

function BookTrackerAuthNav(): React.JSX.Element {
  return (
    <nav className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/80">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          📚 BookTracker
        </Link>
        <div className="flex gap-3 text-sm">
          <Link
            href="/login"
            className="rounded-md px-3 py-1.5 font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-zinc-900 px-3 py-1.5 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-700 dark:hover:bg-zinc-600"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Layout                                                             */
/* ------------------------------------------------------------------ */

export default function BookTrackerAuthShell({
  children,
}: Readonly<{ children: ReactNode }>): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800">
      <BookTrackerAuthNav />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <article className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg dark:bg-zinc-800">
          {children}
        </article>
      </main>
    </div>
  );
}
