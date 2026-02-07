import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import {
  BookTrackerIdentityGate,
  useBookTrackerIdentity,
} from './AuthContext';
import {
  bookTrackerWhoAmI,
  bookTrackerSignup,
  bookTrackerAuthenticate,
  bookTrackerEndSession,
} from '@/lib/api/auth';
import type {
  BookTrackerAccount,
  BookTrackerSessionData,
} from '@/types';

jest.mock('@/lib/api/auth', () => ({
  bookTrackerWhoAmI: jest.fn(),
  bookTrackerSignup: jest.fn(),
  bookTrackerAuthenticate: jest.fn(),
  bookTrackerEndSession: jest.fn(),
}));

const mockedWhoAmI = bookTrackerWhoAmI as jest.Mock;
const mockedSignup = bookTrackerSignup as jest.Mock;
const mockedAuthenticate = bookTrackerAuthenticate as jest.Mock;
const mockedEndSession = bookTrackerEndSession as jest.Mock;

const SAMPLE_ACCOUNT: BookTrackerAccount = {
  userId: 'bt-u-7a3f',
  email: 'curator@booktracker.test',
  displayName: 'Curator',
};

const SAMPLE_SESSION: BookTrackerSessionData = {
  ...SAMPLE_ACCOUNT,
  token: 'jwt-sample-token',
  expiresAt: '2099-12-31T23:59:59Z',
};

function identityGateWrapper({ children }: { children: ReactNode }): React.JSX.Element {
  return <BookTrackerIdentityGate>{children}</BookTrackerIdentityGate>;
}

describe('BookTrackerIdentityGate & useBookTrackerIdentity', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls bookTrackerWhoAmI on mount to hydrate session', async () => {
    mockedWhoAmI.mockRejectedValueOnce(new Error('no session'));

    renderHook(() => useBookTrackerIdentity(), {
      wrapper: identityGateWrapper,
    });

    expect(mockedWhoAmI).toHaveBeenCalledTimes(1);
  });

  it('sets activeAccount when whoAmI resolves', async () => {
    mockedWhoAmI.mockResolvedValueOnce(SAMPLE_ACCOUNT);

    const { result } = renderHook(() => useBookTrackerIdentity(), {
      wrapper: identityGateWrapper,
    });

    await waitFor(() => {
      expect(result.current.activeAccount).toEqual(SAMPLE_ACCOUNT);
    });
  });

  it('sets hydrating to false after mount completes', async () => {
    mockedWhoAmI.mockRejectedValueOnce(new Error('anonymous'));

    const { result } = renderHook(() => useBookTrackerIdentity(), {
      wrapper: identityGateWrapper,
    });

    await waitFor(() => {
      expect(result.current.hydrating).toBe(false);
    });
  });

  it('reports recognized as true when activeAccount is present', async () => {
    mockedWhoAmI.mockResolvedValueOnce(SAMPLE_ACCOUNT);

    const { result } = renderHook(() => useBookTrackerIdentity(), {
      wrapper: identityGateWrapper,
    });

    await waitFor(() => {
      expect(result.current.recognized).toBe(true);
    });
  });

  it('reports recognized as false when no session exists', async () => {
    mockedWhoAmI.mockRejectedValueOnce(new Error('anonymous'));

    const { result } = renderHook(() => useBookTrackerIdentity(), {
      wrapper: identityGateWrapper,
    });

    await waitFor(() => {
      expect(result.current.hydrating).toBe(false);
    });
    expect(result.current.recognized).toBe(false);
  });

  it('performSignup calls bookTrackerSignup and populates activeAccount', async () => {
    mockedWhoAmI.mockRejectedValueOnce(new Error('anonymous'));
    mockedSignup.mockResolvedValueOnce(SAMPLE_SESSION);

    const { result } = renderHook(() => useBookTrackerIdentity(), {
      wrapper: identityGateWrapper,
    });

    await waitFor(() => expect(result.current.hydrating).toBe(false));

    await act(async () => {
      await result.current.performSignup({
        email: SAMPLE_SESSION.email,
        password: 'TrackerPass1',
      });
    });

    expect(mockedSignup).toHaveBeenCalledWith({
      email: SAMPLE_SESSION.email,
      password: 'TrackerPass1',
    });
    expect(result.current.activeAccount).toEqual({
      userId: SAMPLE_SESSION.userId,
      email: SAMPLE_SESSION.email,
      displayName: SAMPLE_SESSION.displayName,
    });
  });

  it('performLogin calls bookTrackerAuthenticate and populates activeAccount', async () => {
    mockedWhoAmI.mockRejectedValueOnce(new Error('anonymous'));
    mockedAuthenticate.mockResolvedValueOnce(SAMPLE_SESSION);

    const { result } = renderHook(() => useBookTrackerIdentity(), {
      wrapper: identityGateWrapper,
    });

    await waitFor(() => expect(result.current.hydrating).toBe(false));

    await act(async () => {
      await result.current.performLogin({
        email: SAMPLE_SESSION.email,
        password: 'TrackerPass1',
      });
    });

    expect(mockedAuthenticate).toHaveBeenCalledWith({
      email: SAMPLE_SESSION.email,
      password: 'TrackerPass1',
    });
    expect(result.current.activeAccount).toEqual({
      userId: SAMPLE_SESSION.userId,
      email: SAMPLE_SESSION.email,
      displayName: SAMPLE_SESSION.displayName,
    });
  });

  it('performLogout calls bookTrackerEndSession and clears activeAccount', async () => {
    mockedWhoAmI.mockResolvedValueOnce(SAMPLE_ACCOUNT);
    mockedEndSession.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useBookTrackerIdentity(), {
      wrapper: identityGateWrapper,
    });

    await waitFor(() => expect(result.current.recognized).toBe(true));

    await act(async () => {
      await result.current.performLogout();
    });

    expect(mockedEndSession).toHaveBeenCalledTimes(1);
    expect(result.current.activeAccount).toBeNull();
    expect(result.current.recognized).toBe(false);
  });

  it('throws when useBookTrackerIdentity is called outside the provider', () => {
    // Suppress React error boundary logging for this intentional throw
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => {
      renderHook(() => useBookTrackerIdentity());
    }).toThrow(
      'useBookTrackerIdentity must be rendered inside <BookTrackerIdentityGate>.',
    );

    spy.mockRestore();
  });
});
