import { render, screen, fireEvent } from '@testing-library/react';
import BookTrackerRatingStars from './BookTrackerRatingStars';

describe('BookTrackerRatingStars', () => {
  it('displays 5 star buttons', () => {
    render(<BookTrackerRatingStars value={0} />);
    const stars = screen.getAllByRole('radio');
    expect(stars).toHaveLength(5);
  });

  it('displays correct number of filled stars', () => {
    render(<BookTrackerRatingStars value={3} readOnly />);
    const stars = screen.getAllByRole('radio');
    // First 3 should be amber (filled), last 2 should not
    expect(stars[0]).toHaveClass('text-amber-400');
    expect(stars[1]).toHaveClass('text-amber-400');
    expect(stars[2]).toHaveClass('text-amber-400');
    expect(stars[3]).not.toHaveClass('text-amber-400');
    expect(stars[4]).not.toHaveClass('text-amber-400');
  });

  it('calls onChange when a star is clicked', () => {
    const onChange = jest.fn();
    render(<BookTrackerRatingStars value={0} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('4 stars'));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('does not call onChange in readOnly mode', () => {
    const onChange = jest.fn();
    render(<BookTrackerRatingStars value={2} onChange={onChange} readOnly />);
    fireEvent.click(screen.getByLabelText('4 stars'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('previews rating on hover', () => {
    const onChange = jest.fn();
    render(<BookTrackerRatingStars value={0} onChange={onChange} />);
    const star4 = screen.getByLabelText('4 stars');
    fireEvent.mouseEnter(star4);
    // After hovering, first 4 stars should be filled
    const stars = screen.getAllByRole('radio');
    expect(stars[0]).toHaveClass('text-amber-400');
    expect(stars[3]).toHaveClass('text-amber-400');
    expect(stars[4]).not.toHaveClass('text-amber-400');
  });

  it('resets hover preview on mouse leave', () => {
    const onChange = jest.fn();
    render(<BookTrackerRatingStars value={2} onChange={onChange} />);
    const star4 = screen.getByLabelText('4 stars');
    fireEvent.mouseEnter(star4);
    // Now leave the container
    const container = screen.getByRole('radiogroup');
    fireEvent.mouseLeave(container);
    // Should go back to value=2, so star 3 should not be filled
    const stars = screen.getAllByRole('radio');
    expect(stars[0]).toHaveClass('text-amber-400');
    expect(stars[1]).toHaveClass('text-amber-400');
    expect(stars[2]).not.toHaveClass('text-amber-400');
  });

  it('marks the correct star as aria-checked', () => {
    render(<BookTrackerRatingStars value={3} readOnly />);
    expect(screen.getByLabelText('3 stars')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByLabelText('2 stars')).toHaveAttribute('aria-checked', 'false');
  });
});
