import type { Metadata } from 'next';
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
        {children}
      </body>
    </html>
  );
}
