import { render, screen } from '@testing-library/react';
import { BookTrackerRecommendationLoading } from './BookTrackerRecommendationLoading';

describe('BookTrackerRecommendationLoading', () => {
  it('displays the loading message', () => {
    render(<BookTrackerRecommendationLoading />);
    expect(
      screen.getByText("Discovering books you'll love..."),
    ).toBeInTheDocument();
  });

  it('displays sub-message about wait time', () => {
    render(<BookTrackerRecommendationLoading />);
    expect(
      screen.getByText('This may take a few seconds'),
    ).toBeInTheDocument();
  });

  it('has an accessible status role', () => {
    render(<BookTrackerRecommendationLoading />);
    expect(
      screen.getByRole('status', { name: 'Generating recommendations' }),
    ).toBeInTheDocument();
  });
});
