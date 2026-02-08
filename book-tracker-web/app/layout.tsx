import type { Metadata } from 'next';
import { BookTrackerIdentityGate } from '@/lib/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Book Tracker - Your Personal Reading Library',
  description: 'Track your reading journey, discover new books, and get AI-powered recommendations tailored to your taste.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="en">
      <body className="antialiased">
        <BookTrackerIdentityGate>
          {children}
        </BookTrackerIdentityGate>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
