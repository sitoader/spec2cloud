import { render, screen } from '@testing-library/react';
import BookTrackerBookGrid from './BookTrackerBookGrid';
import type { BookTrackerBook } from '@/types';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>): React.JSX.Element => {
    const { fill: _fill, unoptimized: _unopt, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text, @typescript-eslint/no-explicit-any
    return <img {...(rest as any)} />;
  },
}));

const SAMPLE_BOOK: BookTrackerBook = {
  id: 'b-001',
  title: 'Test Book',
  author: 'Test Author',
  isbn: null,
  coverImageUrl: null,
  description: null,
  genres: null,
  publicationDate: null,
  status: 'ToRead',
  addedDate: '2024-01-01T00:00:00Z',
  source: null,
  rating: null,
};

describe('BookTrackerBookGrid', () => {
  it('renders a loading skeleton when loading is true', () => {
    render(<BookTrackerBookGrid books={[]} loading={true} />);
    expect(screen.getByLabelText('Loading books')).toBeInTheDocument();
  });

  it('renders an empty state when books array is empty', () => {
    render(<BookTrackerBookGrid books={[]} />);
    expect(screen.getByText('No books yet')).toBeInTheDocument();
  });

  it('renders book cards when books are provided', () => {
    render(<BookTrackerBookGrid books={[SAMPLE_BOOK]} />);
    expect(screen.getByText('Test Book')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
  });

  it('renders the correct number of book cards', () => {
    const books = [
      { ...SAMPLE_BOOK, id: 'b-001' },
      { ...SAMPLE_BOOK, id: 'b-002', title: 'Second Book' },
    ];
    render(<BookTrackerBookGrid books={books} />);
    expect(screen.getByText('Test Book')).toBeInTheDocument();
    expect(screen.getByText('Second Book')).toBeInTheDocument();
  });
});
