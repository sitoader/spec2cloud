import { render, screen } from '@testing-library/react';
import { BookTrackerInsufficientDataBanner } from './BookTrackerInsufficientDataBanner';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }): React.JSX.Element => (
    <a href={href}>{children}</a>
  ),
}));

describe('BookTrackerInsufficientDataBanner', () => {
  it('shows progress toward minimum rated books', () => {
    render(<BookTrackerInsufficientDataBanner ratedCount={1} />);
    expect(screen.getByText(/You've rated 1 of 3 books/)).toBeInTheDocument();
  });

  it('shows remaining count', () => {
    render(<BookTrackerInsufficientDataBanner ratedCount={1} />);
    expect(screen.getByText(/Rate 2 more books to get started/)).toBeInTheDocument();
  });

  it('shows singular when 1 book remaining', () => {
    render(<BookTrackerInsufficientDataBanner ratedCount={2} />);
    expect(screen.getByText(/Rate 1 more book to get started/)).toBeInTheDocument();
  });

  it('displays banner heading', () => {
    render(<BookTrackerInsufficientDataBanner ratedCount={0} />);
    expect(
      screen.getByText('Rate at least 3 books to unlock AI recommendations'),
    ).toBeInTheDocument();
  });

  it('links to library page', () => {
    render(<BookTrackerInsufficientDataBanner ratedCount={0} />);
    const link = screen.getByText('Go to Library');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/books');
  });
});
