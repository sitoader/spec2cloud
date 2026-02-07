import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BookTrackerRecommendationCard } from './BookTrackerRecommendationCard';

describe('BookTrackerRecommendationCard', () => {
  const defaultProps = {
    title: 'Test Book',
    author: 'Test Author',
    genre: 'Fiction',
    reason: 'You enjoyed similar books',
    confidenceScore: 4,
    onAddToTbr: jest.fn().mockResolvedValue(undefined),
    onDismiss: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays book title and author', () => {
    render(<BookTrackerRecommendationCard {...defaultProps} />);
    expect(screen.getByText('Test Book')).toBeInTheDocument();
    expect(screen.getByText('By Test Author')).toBeInTheDocument();
  });

  it('displays genre badge', () => {
    render(<BookTrackerRecommendationCard {...defaultProps} />);
    expect(screen.getByText('Fiction')).toBeInTheDocument();
  });

  it('displays recommendation reason', () => {
    render(<BookTrackerRecommendationCard {...defaultProps} />);
    expect(screen.getByText('You enjoyed similar books')).toBeInTheDocument();
  });

  it('displays confidence stars', () => {
    render(<BookTrackerRecommendationCard {...defaultProps} />);
    expect(screen.getByLabelText('Confidence: 4 out of 5')).toBeInTheDocument();
  });

  it('calls onAddToTbr when Add to TBR is clicked', async () => {
    render(<BookTrackerRecommendationCard {...defaultProps} />);
    fireEvent.click(screen.getByText('Add to TBR'));
    await waitFor(() => {
      expect(defaultProps.onAddToTbr).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onDismiss when Not Interested is clicked', () => {
    render(<BookTrackerRecommendationCard {...defaultProps} />);
    fireEvent.click(screen.getByText('Not Interested'));
    expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
  });

  it('shows "Added" state when isAdded is true', () => {
    render(<BookTrackerRecommendationCard {...defaultProps} isAdded={true} />);
    expect(screen.getByText('✓ Added')).toBeInTheDocument();
    expect(screen.queryByText('Add to TBR')).not.toBeInTheDocument();
  });

  it('hides genre when not provided', () => {
    const { genre: _genre, ...propsWithoutGenre } = defaultProps;
    render(<BookTrackerRecommendationCard {...propsWithoutGenre} />);
    expect(screen.queryByText('Fiction')).not.toBeInTheDocument();
  });
});
