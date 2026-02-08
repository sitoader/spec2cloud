import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BookTrackerAddBookForm from './BookTrackerAddBookForm';
import * as booksApi from '@/lib/api/books';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: mockPush })),
}));

jest.mock('@/lib/api/books', () => ({
  bookTrackerAddBook: jest.fn(),
  bookTrackerReadableError: jest.fn(() => 'Something went wrong'),
}));

const mockedAddBook = booksApi.bookTrackerAddBook as jest.Mock;

describe('BookTrackerAddBookForm', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the form with required fields', () => {
    render(<BookTrackerAddBookForm />);
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/author/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/reading status/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add to library/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty required fields', async () => {
    render(<BookTrackerAddBookForm />);

    fireEvent.click(screen.getByRole('button', { name: /add to library/i }));

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });
  });

  it('calls bookTrackerAddBook with correct data on valid submission', async () => {
    mockedAddBook.mockResolvedValueOnce({
      id: 'b-new',
      title: 'New Book',
      author: 'Author',
      status: 'ToRead',
    });

    render(<BookTrackerAddBookForm />);

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'New Book' },
    });
    fireEvent.change(screen.getByLabelText(/author/i), {
      target: { value: 'Author' },
    });

    fireEvent.click(screen.getByRole('button', { name: /add to library/i }));

    await waitFor(() => {
      expect(mockedAddBook).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Book',
          author: 'Author',
          status: 'ToRead',
        }),
      );
    });
  });

  it('navigates to the book detail page on success', async () => {
    mockedAddBook.mockResolvedValueOnce({ id: 'b-new' });

    render(<BookTrackerAddBookForm />);

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'New Book' },
    });
    fireEvent.change(screen.getByLabelText(/author/i), {
      target: { value: 'Author' },
    });

    fireEvent.click(screen.getByRole('button', { name: /add to library/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/books/b-new');
    });
  });
});
