import { render, screen, fireEvent } from '@testing-library/react';
import BookTrackerPreferencesForm from './BookTrackerPreferencesForm';

describe('BookTrackerPreferencesForm', () => {
  const defaultProps = {
    onSave: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders genre checkboxes', () => {
    render(<BookTrackerPreferencesForm {...defaultProps} />);
    expect(screen.getByText('Fiction')).toBeInTheDocument();
    expect(screen.getByText('Science Fiction')).toBeInTheDocument();
    expect(screen.getByText('Fantasy')).toBeInTheDocument();
    expect(screen.getByText('Mystery')).toBeInTheDocument();
  });

  it('renders theme and author inputs', () => {
    render(<BookTrackerPreferencesForm {...defaultProps} />);
    expect(screen.getByLabelText('Preferred Themes / Topics')).toBeInTheDocument();
    expect(screen.getByLabelText('Favorite Authors')).toBeInTheDocument();
  });

  it('renders save button', () => {
    render(<BookTrackerPreferencesForm {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Save Preferences' })).toBeInTheDocument();
  });

  it('toggles genre selection', () => {
    render(<BookTrackerPreferencesForm {...defaultProps} />);
    const fictionCheckbox = screen.getByRole('checkbox', { name: 'Fiction' });
    expect(fictionCheckbox).not.toBeChecked();
    fireEvent.click(fictionCheckbox);
    expect(fictionCheckbox).toBeChecked();
    fireEvent.click(fictionCheckbox);
    expect(fictionCheckbox).not.toBeChecked();
  });

  it('calls onSave with parsed data', () => {
    render(<BookTrackerPreferencesForm {...defaultProps} />);
    // Select a genre
    fireEvent.click(screen.getByRole('checkbox', { name: 'Fantasy' }));
    // Enter themes
    fireEvent.change(screen.getByLabelText('Preferred Themes / Topics'), {
      target: { value: 'magic, dragons' },
    });
    // Enter authors
    fireEvent.change(screen.getByLabelText('Favorite Authors'), {
      target: { value: 'Brandon Sanderson, Patrick Rothfuss' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save Preferences' }));
    expect(defaultProps.onSave).toHaveBeenCalledWith(
      ['Fantasy'],
      ['magic', 'dragons'],
      ['Brandon Sanderson', 'Patrick Rothfuss'],
    );
  });

  it('displays initial preferences', () => {
    render(
      <BookTrackerPreferencesForm
        {...defaultProps}
        initialGenres={['Fiction', 'Mystery']}
        initialThemes={['time travel']}
        initialAuthors={['Agatha Christie']}
      />,
    );
    expect(screen.getByRole('checkbox', { name: 'Fiction' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Mystery' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Fantasy' })).not.toBeChecked();
    expect(screen.getByLabelText('Preferred Themes / Topics')).toHaveValue('time travel');
    expect(screen.getByLabelText('Favorite Authors')).toHaveValue('Agatha Christie');
  });

  it('shows saving state', () => {
    render(<BookTrackerPreferencesForm {...defaultProps} saving={true} />);
    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
  });

  it('filters out empty items from comma-separated inputs', () => {
    render(<BookTrackerPreferencesForm {...defaultProps} />);
    fireEvent.change(screen.getByLabelText('Preferred Themes / Topics'), {
      target: { value: 'magic, , dragons, ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save Preferences' }));
    expect(defaultProps.onSave).toHaveBeenCalledWith(
      [],
      ['magic', 'dragons'],
      [],
    );
  });
});
