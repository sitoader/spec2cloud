import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BookTrackerSignInPanel from './LoginForm';
import { useBookTrackerIdentity } from '@/lib/contexts/AuthContext';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: mockPush })),
}));

jest.mock('@/lib/contexts/AuthContext', () => ({
  useBookTrackerIdentity: jest.fn(),
}));

const mockedUseIdentity = useBookTrackerIdentity as jest.Mock;

const stubPerformLogin = jest.fn();

function mountSignInPanel(): ReturnType<typeof render> {
  mockedUseIdentity.mockReturnValue({
    activeAccount: null,
    hydrating: false,
    recognized: false,
    performSignup: jest.fn(),
    performLogin: stubPerformLogin,
    performLogout: jest.fn(),
  });
  return render(<BookTrackerSignInPanel />);
}

describe('BookTrackerSignInPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the email input field', () => {
    mountSignInPanel();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('renders the password input field', () => {
    mountSignInPanel();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('shows the remember me checkbox', () => {
    mountSignInPanel();
    expect(screen.getByRole('checkbox', { name: /remember me/i })).toBeInTheDocument();
  });

  it('shows a forgot password link', () => {
    mountSignInPanel();
    expect(screen.getByRole('link', { name: /forgot password/i })).toBeInTheDocument();
  });

  it('calls performLogin with correct data on valid submission', async () => {
    stubPerformLogin.mockResolvedValueOnce(undefined);
    mountSignInPanel();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'shelf.owner@booktracker.test' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'PageTurner7' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: /sign in to booktracker/i }),
    );

    await waitFor(() => {
      expect(stubPerformLogin).toHaveBeenCalledWith({
        email: 'shelf.owner@booktracker.test',
        password: 'PageTurner7',
        rememberMe: false,
      });
    });
  });
});
