import { render, screen, fireEvent } from '@testing-library/react';
import { BookTrackerGenerateButton } from './BookTrackerGenerateButton';

describe('BookTrackerGenerateButton', () => {
  const defaultProps = {
    onClick: jest.fn(),
    isGenerating: false,
    hasExistingRecommendations: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows "Get Recommendations" when no existing recommendations', () => {
    render(<BookTrackerGenerateButton {...defaultProps} />);
    expect(screen.getByText('Get Recommendations')).toBeInTheDocument();
  });

  it('shows "Refresh Recommendations" when recommendations exist', () => {
    render(
      <BookTrackerGenerateButton {...defaultProps} hasExistingRecommendations={true} />,
    );
    expect(screen.getByText('Refresh Recommendations')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    render(<BookTrackerGenerateButton {...defaultProps} />);
    fireEvent.click(screen.getByRole('button'));
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state during generation', () => {
    render(<BookTrackerGenerateButton {...defaultProps} isGenerating={true} />);
    expect(screen.getByText('Generating...')).toBeInTheDocument();
  });

  it('is disabled during generation', () => {
    render(<BookTrackerGenerateButton {...defaultProps} isGenerating={true} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when isDisabled is true', () => {
    render(<BookTrackerGenerateButton {...defaultProps} isDisabled={true} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
