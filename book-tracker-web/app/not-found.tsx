import Link from 'next/link';

export default function NotFound(): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-900">
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-6xl font-bold text-zinc-900 dark:text-zinc-100">
          404
        </h1>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Page not found
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <Link
          href="/"
          className="inline-block rounded-md bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-700 dark:hover:bg-zinc-600"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
