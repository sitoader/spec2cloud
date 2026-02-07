'use client';

/**
 * BookTracker application header with navigation and user menu.
 */

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBookTrackerIdentity } from '@/lib/contexts/AuthContext';

export function BookTrackerHeader(): React.JSX.Element {
  const { activeAccount, performLogout } = useBookTrackerIdentity();
  const router = useRouter();

  const handleLogout = async (): Promise<void> => {
    try {
      await performLogout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!activeAccount) {
    return <></>;
  }

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-8">
            <Link
              href="/books"
              className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              📚 BookTracker
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              <Link
                href="/books"
                className="text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
              >
                My Library
              </Link>
              <Link
                href="/search"
                className="text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
              >
                Search Books
              </Link>
              <Link
                href="/recommendations"
                className="text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
              >
                Recommendations
              </Link>
              <Link
                href="/preferences"
                className="text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
              >
                Preferences
              </Link>
            </nav>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {activeAccount.displayName || activeAccount.email}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {activeAccount.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
