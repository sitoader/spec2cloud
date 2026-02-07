import { render, screen, fireEvent } from '@testing-library/react';
import BookTrackerRatingForm from './BookTrackerRatingForm';

describe('BookTrackerRatingForm', () => {
  const defaultProps = {
    onSave: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders star rating and notes input', () => {
    render(<BookTrackerRatingForm {...defaultProps} />);
    expect(screen.getByText('Your Rating')).toBeInTheDocument();
    expect(screen.getByLabelText('Notes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Rating' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('displays character counter', () => {
    render(<BookTrackerRatingForm {...defaultProps} />);
    expect(screen.getByText('0/1000 characters')).toBeInTheDocument();
  });

  it('updates character counter when typing', () => {
    render(<BookTrackerRatingForm {...defaultProps} />);
    fireEvent.change(screen.getByLabelText('Notes'), {
      target: { value: 'Great book!' },
    });
    expect(screen.getByText('11/1000 characters')).toBeInTheDocument();
  });

  it('shows error when saving without selecting a rating', () => {
    render(<BookTrackerRatingForm {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Save Rating' }));
    expect(screen.getByText('Please select a rating between 1 and 5 stars.')).toBeInTheDocument();
    expect(defaultProps.onSave).not.toHaveBeenCalled();
  });

  it('calls onSave with score and notes when valid', () => {
    render(<BookTrackerRatingForm {...defaultProps} initialScore={4} />);
    fireEvent.change(screen.getByLabelText('Notes'), {
      target: { value: 'Loved it!' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save Rating' }));
    expect(defaultProps.onSave).toHaveBeenCalledWith(4, 'Loved it!');
  });

  it('calls onSave with undefined notes when notes are empty', () => {
    render(<BookTrackerRatingForm {...defaultProps} initialScore={3} />);
    fireEvent.click(screen.getByRole('button', { name: 'Save Rating' }));
    expect(defaultProps.onSave).toHaveBeenCalledWith(3, undefined);
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<BookTrackerRatingForm {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('shows saving state', () => {
    render(<BookTrackerRatingForm {...defaultProps} saving={true} />);
    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
  });

  it('renders with initial values', () => {
    render(
      <BookTrackerRatingForm
        {...defaultProps}
        initialScore={5}
        initialNotes="A masterpiece"
      />,
    );
    expect(screen.getByLabelText('Notes')).toHaveValue('A masterpiece');
    expect(screen.getByText('13/1000 characters')).toBeInTheDocument();
  });
});
