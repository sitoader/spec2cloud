import Link from 'next/link';

export default function Home(): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              📚 Book Tracker
            </h1>
            <div className="flex gap-4">
              <Link
                href="/login"
                className="rounded-md px-4 py-2 font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-zinc-900 px-4 py-2 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-700 dark:hover:bg-zinc-600"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="max-w-3xl space-y-8 text-center">
          {/* Hero Section */}
          <div className="space-y-4">
            <h2 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-6xl">
              Your Personal Reading Journey
            </h2>
            <p className="text-xl text-zinc-600 dark:text-zinc-400">
              Track your books, discover new reads, and get AI-powered
              recommendations tailored just for you.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid gap-6 pt-8 sm:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <div className="text-3xl">📖</div>
              <h3 className="mt-2 font-semibold text-zinc-900 dark:text-zinc-100">
                Track Your Library
              </h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Organize your reading collection with ease
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <div className="text-3xl">🔍</div>
              <h3 className="mt-2 font-semibold text-zinc-900 dark:text-zinc-100">
                Discover Books
              </h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Search millions of books from multiple sources
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <div className="text-3xl">🤖</div>
              <h3 className="mt-2 font-semibold text-zinc-900 dark:text-zinc-100">
                AI Recommendations
              </h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Get personalized suggestions powered by AI
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-8">
            <Link
              href="/register"
              className="inline-block rounded-lg bg-zinc-900 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:scale-105 hover:bg-zinc-800 dark:bg-zinc-700 dark:hover:bg-zinc-600"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          © 2024 Book Tracker. Built with Next.js and TypeScript.
        </div>
      </footer>
    </div>
  );
}
