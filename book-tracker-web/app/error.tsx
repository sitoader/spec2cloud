'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  useEffect(() => {
    // Log error to console (Application Insights in production)
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-900">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-lg dark:bg-zinc-800">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Something went wrong
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            We encountered an unexpected error. Please try again.
          </p>
        </div>
        
        {error.digest && (
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-500">
            Error ID: {error.digest}
          </p>
        )}
        
        <button
          onClick={reset}
          className="w-full rounded-md bg-zinc-900 px-4 py-2 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-700 dark:hover:bg-zinc-600"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
