import { render, screen, fireEvent } from '@testing-library/react';
import BookTrackerBookFilters from './BookTrackerBookFilters';

describe('BookTrackerBookFilters', () => {
  const defaultProps = {
    statusFilter: '' as const,
    searchQuery: '',
    onStatusChange: jest.fn(),
    onSearchChange: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders all status filter tabs', () => {
    render(<BookTrackerBookFilters {...defaultProps} />);
    expect(screen.getByRole('tab', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Read' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'TBR' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Reading' })).toBeInTheDocument();
  });

  it('renders the search input', () => {
    render(<BookTrackerBookFilters {...defaultProps} />);
    expect(screen.getByLabelText('Search books')).toBeInTheDocument();
  });

  it('calls onStatusChange when a status tab is clicked', () => {
    render(<BookTrackerBookFilters {...defaultProps} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Read' }));
    expect(defaultProps.onStatusChange).toHaveBeenCalledWith('Completed');
  });

  it('calls onSearchChange when typing in the search box', () => {
    render(<BookTrackerBookFilters {...defaultProps} />);
    fireEvent.change(screen.getByLabelText('Search books'), {
      target: { value: 'gatsby' },
    });
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('gatsby');
  });

  it('shows clear button when there are active filters', () => {
    render(
      <BookTrackerBookFilters {...defaultProps} statusFilter="Completed" />,
    );
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
  });

  it('does not show clear button when there are no filters', () => {
    render(<BookTrackerBookFilters {...defaultProps} />);
    expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
  });

  it('calls both onStatusChange and onSearchChange when clear is clicked', () => {
    render(
      <BookTrackerBookFilters
        {...defaultProps}
        statusFilter="Completed"
        searchQuery="test"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(defaultProps.onStatusChange).toHaveBeenCalledWith('');
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('');
  });
});
