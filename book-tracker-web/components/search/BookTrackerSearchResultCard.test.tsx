/**
 * Unit tests for BookTrackerSearchResultCard.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BookTrackerSearchResultCard from './BookTrackerSearchResultCard';
import type { BookTrackerExternalBook } from '@/types';

const SAMPLE_BOOK: BookTrackerExternalBook = {
  externalId: 'gbooks-xyz',
  title: 'Left Hand of Darkness',
  author: 'Ursula K. Le Guin',
  isbn: '978-0-441-47812-5',
  coverImageUrl: 'https://covers.example.org/lhod.jpg',
  description: 'An envoy from a galactic civilisation visits a planet where gender is fluid.',
  genres: ['Science Fiction', 'Literary Fiction'],
  publicationYear: 1969,
  source: 'google-books',
};

describe('BookTrackerSearchResultCard', () => {
  it('displays the book title, author, and publication year', () => {
    render(
      <BookTrackerSearchResultCard
        externalBook={SAMPLE_BOOK}
        onAddToLibrary={jest.fn()}
        onOpenDetail={jest.fn()}
      />,
    );

    expect(screen.getByText('Left Hand of Darkness')).toBeInTheDocument();
    expect(screen.getByText('Ursula K. Le Guin')).toBeInTheDocument();
    expect(screen.getByText('1969')).toBeInTheDocument();
  });

  it('shows genres as tags', () => {
    render(
      <BookTrackerSearchResultCard
        externalBook={SAMPLE_BOOK}
        onAddToLibrary={jest.fn()}
        onOpenDetail={jest.fn()}
      />,
    );

    expect(screen.getByText('Science Fiction')).toBeInTheDocument();
    expect(screen.getByText('Literary Fiction')).toBeInTheDocument();
  });

  it('renders a cover image when coverImageUrl is provided', () => {
    render(
      <BookTrackerSearchResultCard
        externalBook={SAMPLE_BOOK}
        onAddToLibrary={jest.fn()}
        onOpenDetail={jest.fn()}
      />,
    );

    const coverImg = screen.getByAltText('Cover of Left Hand of Darkness');
    expect(coverImg).toBeInTheDocument();
  });

  it('renders a letter glyph fallback when no cover image exists', () => {
    const nocover = { ...SAMPLE_BOOK, coverImageUrl: undefined };
    render(
      <BookTrackerSearchResultCard
        externalBook={nocover}
        onAddToLibrary={jest.fn()}
        onOpenDetail={jest.fn()}
      />,
    );

    expect(screen.getByText('L')).toBeInTheDocument();
  });

  it('opens the detail view when the card body is clicked', () => {
    const detailSpy = jest.fn();
    render(
      <BookTrackerSearchResultCard
        externalBook={SAMPLE_BOOK}
        onAddToLibrary={jest.fn()}
        onOpenDetail={detailSpy}
      />,
    );

    fireEvent.click(screen.getByText('Left Hand of Darkness'));
    expect(detailSpy).toHaveBeenCalledWith(SAMPLE_BOOK);
  });

  it('calls onAddToLibrary with ToRead when the button is clicked', async () => {
    const addSpy = jest.fn().mockResolvedValue(undefined);
    render(
      <BookTrackerSearchResultCard
        externalBook={SAMPLE_BOOK}
        onAddToLibrary={addSpy}
        onOpenDetail={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByText('+ To Read'));
    await waitFor(() => {
      expect(addSpy).toHaveBeenCalledWith(SAMPLE_BOOK, 'ToRead');
    });
  });

  it('calls onAddToLibrary with Reading when the button is clicked', async () => {
    const addSpy = jest.fn().mockResolvedValue(undefined);
    render(
      <BookTrackerSearchResultCard
        externalBook={SAMPLE_BOOK}
        onAddToLibrary={addSpy}
        onOpenDetail={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByText('+ Reading'));
    await waitFor(() => {
      expect(addSpy).toHaveBeenCalledWith(SAMPLE_BOOK, 'Reading');
    });
  });
});
