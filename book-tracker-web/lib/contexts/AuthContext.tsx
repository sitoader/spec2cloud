'use client';

/**
 * BookTracker identity context.
 *
 * Provides authentication state and actions to every client component
 * in the tree via {@link useBookTrackerIdentity}.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type {
  BookTrackerAccount,
  BookTrackerSignupPayload,
  BookTrackerCredentials,
} from '@/types';
import {
  bookTrackerSignup,
  bookTrackerAuthenticate,
  bookTrackerEndSession,
  bookTrackerWhoAmI,
} from '@/lib/api/auth';

/* ------------------------------------------------------------------ */
/*  Public contract                                                    */
/* ------------------------------------------------------------------ */

/** Shape of the value exposed through the BookTracker identity context. */
export interface BookTrackerIdentitySnapshot {
  /** The currently signed-in account, or `null` while anonymous. */
  activeAccount: BookTrackerAccount | null;
  /** `true` while the initial /me probe is still in-flight. */
  hydrating: boolean;
  /** Convenience flag — `true` when {@link activeAccount} is non-null. */
  recognized: boolean;
  /** Create a new account and sign in immediately. */
  performSignup: (payload: BookTrackerSignupPayload) => Promise<void>;
  /** Authenticate with existing credentials. */
  performLogin: (creds: BookTrackerCredentials) => Promise<void>;
  /** Destroy the active session and clear local state. */
  performLogout: () => Promise<void>;
}

/* ------------------------------------------------------------------ */
/*  Context plumbing                                                   */
/* ------------------------------------------------------------------ */

const BookTrackerIdentityCtx = createContext<BookTrackerIdentitySnapshot | undefined>(
  undefined,
);
BookTrackerIdentityCtx.displayName = 'BookTrackerIdentityCtx';

/**
 * Consume the BookTracker identity context.
 *
 * @throws if called outside of a `<BookTrackerIdentityGate>` provider.
 */
export function useBookTrackerIdentity(): BookTrackerIdentitySnapshot {
  const snapshot = useContext(BookTrackerIdentityCtx);
  if (snapshot === undefined) {
    throw new Error(
      'useBookTrackerIdentity must be rendered inside <BookTrackerIdentityGate>.',
    );
  }
  return snapshot;
}

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

interface BookTrackerIdentityGateProps {
  children: ReactNode;
}

/**
 * Wrap the component tree with this provider to make authentication
 * state available everywhere via {@link useBookTrackerIdentity}.
 */
export function BookTrackerIdentityGate({
  children,
}: BookTrackerIdentityGateProps): React.JSX.Element {
  const [activeAccount, setActiveAccount] = useState<BookTrackerAccount | null>(null);
  const [hydrating, setHydrating] = useState<boolean>(true);

  /* ---------- hydrate on mount ---------- */
  useEffect(() => {
    let stale = false;

    bookTrackerWhoAmI()
      .then((account) => {
        if (!stale) setActiveAccount(account);
      })
      .catch(() => {
        /* anonymous session — nothing to restore */
      })
      .finally(() => {
        if (!stale) setHydrating(false);
      });

    return (): void => {
      stale = true;
    };
  }, []);

  /* ---------- actions ---------- */
  const performSignup = useCallback(
    async (payload: BookTrackerSignupPayload): Promise<void> => {
      const session = await bookTrackerSignup(payload);
      setActiveAccount({
        userId: session.userId,
        email: session.email,
        displayName: session.displayName,
      });
    },
    [],
  );

  const performLogin = useCallback(
    async (creds: BookTrackerCredentials): Promise<void> => {
      const session = await bookTrackerAuthenticate(creds);
      setActiveAccount({
        userId: session.userId,
        email: session.email,
        displayName: session.displayName,
      });
    },
    [],
  );

  const performLogout = useCallback(async (): Promise<void> => {
    await bookTrackerEndSession();
    setActiveAccount(null);
  }, []);

  /* ---------- snapshot ---------- */
  const snapshot = useMemo<BookTrackerIdentitySnapshot>(
    () => ({
      activeAccount,
      hydrating,
      recognized: activeAccount !== null,
      performSignup,
      performLogin,
      performLogout,
    }),
    [activeAccount, hydrating, performSignup, performLogin, performLogout],
  );

  return (
    <BookTrackerIdentityCtx.Provider value={snapshot}>
      {children}
    </BookTrackerIdentityCtx.Provider>
  );
}
