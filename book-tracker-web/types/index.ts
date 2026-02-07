/**
 * BookTracker — shared TypeScript contracts.
 *
 * Every interface in this module mirrors a backend DTO from the
 * ASP.NET BookTracker API so the front-end stays in lockstep with
 * the wire format.
 */

/** @deprecated Prefer {@link BookTrackerAccount} for authenticated identity. */
export type User = {
  id: string;
  email: string;
  name: string;
};

/* ------------------------------------------------------------------ */
/*  Request payloads                                                   */
/* ------------------------------------------------------------------ */

/** Wire payload for POST /api/auth/register. */
export interface BookTrackerSignupPayload {
  email: string;
  password: string;
  displayName?: string;
}

/** Wire payload for POST /api/auth/login. */
export interface BookTrackerCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Response shapes                                                    */
/* ------------------------------------------------------------------ */

/** Successful auth response from register or login endpoints. */
export interface BookTrackerSessionData {
  userId: string;
  email: string;
  displayName: string;
  token: string;
  expiresAt: string;
}

/** Lightweight identity returned by GET /api/auth/me. */
export interface BookTrackerAccount {
  userId: string;
  email: string;
  displayName: string;
}

/** Standard error envelope produced by the BookTracker API. */
export interface BookTrackerErrorEnvelope {
  message: string;
  errors?: Record<string, string[]>;
  traceId?: string;
}
