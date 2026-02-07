/**
 * Unit tests for BookTrackerSearchResults.
 */

import { render, screen } from '@testing-library/react';
import BookTrackerSearchResults from './BookTrackerSearchResults';
import type { BookTrackerExternalBook } from '@/types';

/* Mock the child card to keep tests focused on the grid itself. */
jest.mock('./BookTrackerSearchResultCard', () => ({
  __esModule: true,
  default: ({ externalBook }: { externalBook: BookTrackerExternalBook }): React.JSX.Element => (
    <div data-testid="result-card">{externalBook.title}</div>
  ),
}));

const SAMPLE_HIT: BookTrackerExternalBook = {
  externalId: 'ext-42',
  title: 'Dune',
  author: 'Frank Herbert',
  source: 'google-books',
};

const noop = jest.fn();

describe('BookTrackerSearchResults', () => {
  it('shows a loading skeleton when isBusy is true', () => {
    render(
      <BookTrackerSearchResults
        hits={[]}
        isBusy={true}
        hasSearched={false}
        onAddToLibrary={noop}
        onOpenDetail={noop}
      />,
    );
    expect(screen.getByLabelText('Loading search results')).toBeInTheDocument();
  });

  it('shows empty state after a search yields no hits', () => {
    render(
      <BookTrackerSearchResults
        hits={[]}
        isBusy={false}
        hasSearched={true}
        onAddToLibrary={noop}
        onOpenDetail={noop}
      />,
    );
    expect(screen.getByText('No books found')).toBeInTheDocument();
  });

  it('renders nothing before any search is performed', () => {
    const { container } = render(
      <BookTrackerSearchResults
        hits={[]}
        isBusy={false}
        hasSearched={false}
        onAddToLibrary={noop}
        onOpenDetail={noop}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders one card per hit in the results list', () => {
    const twoHits: BookTrackerExternalBook[] = [
      { ...SAMPLE_HIT, externalId: 'a' },
      { ...SAMPLE_HIT, externalId: 'b', title: 'Foundation' },
    ];

    render(
      <BookTrackerSearchResults
        hits={twoHits}
        isBusy={false}
        hasSearched={true}
        onAddToLibrary={noop}
        onOpenDetail={noop}
      />,
    );

    const cards = screen.getAllByTestId('result-card');
    expect(cards).toHaveLength(2);
    expect(screen.getByText('Dune')).toBeInTheDocument();
    expect(screen.getByText('Foundation')).toBeInTheDocument();
  });
});
