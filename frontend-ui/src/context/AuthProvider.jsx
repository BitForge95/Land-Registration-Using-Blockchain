import { useCallback, useMemo, useState } from 'react';
import {
  ROLES,
  authenticate,
  clearSession,
  readSession,
  registerCitizen,
  writeSession,
} from '../services/authService';
import { AuthContext } from './auth-context';

/**
 * Holds the signed-in session and exposes the current role.
 *
 * The session is restored from localStorage on boot so a page refresh doesn't
 * sign the user out. See `authService` for why this gates the interface rather
 * than securing the API.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readSession());

  const adopt = useCallback((user) => {
    const next = { username: user.username, role: user.role, signedInAt: new Date().toISOString() };
    writeSession(next);
    setSession(next);
    return next;
  }, []);

  const signIn = useCallback(
    async (username, password) => adopt(await authenticate(username, password)),
    [adopt],
  );

  const signUp = useCallback(
    async (username, password) => adopt(await registerCitizen(username, password)),
    [adopt],
  );

  const signOut = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const value = useMemo(() => ({
    username: session?.username ?? null,
    role: session?.role ?? null,
    isAuthenticated: Boolean(session?.username),
    isAdmin: session?.role === ROLES.ADMIN,
    signIn,
    signUp,
    signOut,
  }), [session, signIn, signUp, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
