import { render, screen } from '@testing-library/react';
import BookTrackerStatusBadge from './BookTrackerStatusBadge';

describe('BookTrackerStatusBadge', () => {
  it('renders "To Read" for ToRead status', () => {
    render(<BookTrackerStatusBadge status="ToRead" />);
    expect(screen.getByText('To Read')).toBeInTheDocument();
  });

  it('renders "Reading" for Reading status', () => {
    render(<BookTrackerStatusBadge status="Reading" />);
    expect(screen.getByText('Reading')).toBeInTheDocument();
  });

  it('renders "Completed" for Completed status', () => {
    render(<BookTrackerStatusBadge status="Completed" />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('applies additional className when provided', () => {
    const { container } = render(
      <BookTrackerStatusBadge status="ToRead" className="extra-class" />,
    );
    expect(container.firstChild).toHaveClass('extra-class');
  });
});
