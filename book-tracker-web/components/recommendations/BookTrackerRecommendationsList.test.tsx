import { render, screen } from '@testing-library/react';
import { BookTrackerRecommendationsList } from './BookTrackerRecommendationsList';
import type { BookTrackerBookRecommendation } from '@/types';

const SAMPLE_REC: BookTrackerBookRecommendation = {
  title: 'Test Book',
  author: 'Test Author',
  genre: 'Fiction',
  reason: 'Great read',
  confidenceScore: 4,
};

describe('BookTrackerRecommendationsList', () => {
  const defaultProps = {
    recommendations: [] as BookTrackerBookRecommendation[],
    isLoading: false,
    addedTitles: new Set<string>(),
    onAddToTbr: jest.fn().mockResolvedValue(undefined),
    onDismiss: jest.fn(),
  };

  it('shows loading state when isLoading is true', () => {
    render(<BookTrackerRecommendationsList {...defaultProps} isLoading={true} />);
    expect(
      screen.getByRole('status', { name: 'Generating recommendations' }),
    ).toBeInTheDocument();
  });

  it('shows empty state when no recommendations', () => {
    render(<BookTrackerRecommendationsList {...defaultProps} />);
    expect(screen.getByText('No recommendations yet')).toBeInTheDocument();
  });

  it('renders recommendation cards when provided', () => {
    render(
      <BookTrackerRecommendationsList
        {...defaultProps}
        recommendations={[SAMPLE_REC]}
      />,
    );
    expect(screen.getByText('Test Book')).toBeInTheDocument();
    expect(screen.getByText('By Test Author')).toBeInTheDocument();
  });

  it('marks cards as added when title is in addedTitles', () => {
    render(
      <BookTrackerRecommendationsList
        {...defaultProps}
        recommendations={[SAMPLE_REC]}
        addedTitles={new Set(['Test Book'])}
      />,
    );
    expect(screen.getByText('✓ Added')).toBeInTheDocument();
  });
});
