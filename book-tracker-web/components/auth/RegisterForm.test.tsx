import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BookTrackerRegistrationPanel from './RegisterForm';
import { useBookTrackerIdentity } from '@/lib/contexts/AuthContext';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: mockPush })),
}));

jest.mock('@/lib/contexts/AuthContext', () => ({
  useBookTrackerIdentity: jest.fn(),
}));

const mockedUseIdentity = useBookTrackerIdentity as jest.Mock;

const stubPerformSignup = jest.fn();

function mountRegistrationPanel(): ReturnType<typeof render> {
  mockedUseIdentity.mockReturnValue({
    activeAccount: null,
    hydrating: false,
    recognized: false,
    performSignup: stubPerformSignup,
    performLogin: jest.fn(),
    performLogout: jest.fn(),
  });
  return render(<BookTrackerRegistrationPanel />);
}

describe('BookTrackerRegistrationPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the email input field', () => {
    mountRegistrationPanel();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('renders the display name input field', () => {
    mountRegistrationPanel();
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
  });

  it('renders the password input field', () => {
    mountRegistrationPanel();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  });

  it('renders the confirm password input field', () => {
    mountRegistrationPanel();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('has a submit button with the correct label', () => {
    mountRegistrationPanel();
    expect(
      screen.getByRole('button', { name: /create booktracker account/i }),
    ).toBeInTheDocument();
  });

  it('shows validation errors when submitting an empty form', async () => {
    mountRegistrationPanel();

    fireEvent.click(
      screen.getByRole('button', { name: /create booktracker account/i }),
    );

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('calls performSignup with correct data on valid submission', async () => {
    stubPerformSignup.mockResolvedValueOnce(undefined);
    mountRegistrationPanel();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'new.reader@booktracker.test' },
    });
    fireEvent.change(screen.getByLabelText(/display name/i), {
      target: { value: 'New Reader' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'Chapters9' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'Chapters9' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: /create booktracker account/i }),
    );

    await waitFor(() => {
      expect(stubPerformSignup).toHaveBeenCalledWith({
        email: 'new.reader@booktracker.test',
        password: 'Chapters9',
        displayName: 'New Reader',
      });
    });
  });
});
