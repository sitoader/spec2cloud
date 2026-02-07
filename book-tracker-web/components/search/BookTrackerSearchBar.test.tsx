/**
 * Unit tests for BookTrackerSearchBar.
 */

import { render, screen, fireEvent, act } from '@testing-library/react';
import BookTrackerSearchBar from './BookTrackerSearchBar';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('BookTrackerSearchBar', () => {
  it('renders the search input with placeholder text', () => {
    render(<BookTrackerSearchBar onSearchRequest={jest.fn()} isBusy={false} />);
    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByLabelText('Search books')).toBeInTheDocument();
  });

  it('does not fire the callback when fewer than minChars are typed', () => {
    const spy = jest.fn();
    render(<BookTrackerSearchBar onSearchRequest={spy} isBusy={false} />);

    fireEvent.change(screen.getByLabelText('Search books'), {
      target: { value: 'ab' },
    });

    act(() => jest.advanceTimersByTime(600));
    expect(spy).not.toHaveBeenCalled();
  });

  it('fires the callback after the debounce period once threshold is met', () => {
    const spy = jest.fn();
    render(<BookTrackerSearchBar onSearchRequest={spy} isBusy={false} debounceMs={300} />);

    fireEvent.change(screen.getByLabelText('Search books'), {
      target: { value: 'neuromancer' },
    });

    // Not yet
    act(() => jest.advanceTimersByTime(200));
    expect(spy).not.toHaveBeenCalled();

    // Now
    act(() => jest.advanceTimersByTime(200));
    expect(spy).toHaveBeenCalledWith('neuromancer');
  });

  it('shows the clear button when the input has text', () => {
    render(<BookTrackerSearchBar onSearchRequest={jest.fn()} isBusy={false} />);

    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Search books'), {
      target: { value: 'sci-fi' },
    });

    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('clears the input and fires an empty string on clear', () => {
    const spy = jest.fn();
    render(<BookTrackerSearchBar onSearchRequest={spy} isBusy={false} />);

    const input = screen.getByLabelText('Search books') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'dune' } });
    fireEvent.click(screen.getByLabelText('Clear search'));

    expect(input.value).toBe('');
    expect(spy).toHaveBeenCalledWith('');
  });

  it('renders a spinner when isBusy and input meets threshold', () => {
    render(<BookTrackerSearchBar onSearchRequest={jest.fn()} isBusy={true} />);

    fireEvent.change(screen.getByLabelText('Search books'), {
      target: { value: 'fiction' },
    });

    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
