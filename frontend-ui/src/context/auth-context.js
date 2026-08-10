import { createContext, useContext } from 'react';

/**
 * Shared auth context.
 *
 * Kept apart from the provider component so that file exports a component and
 * nothing else — React Fast Refresh (and the `react-refresh/only-export-components`
 * lint rule) requires that split.
 */
export const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an <AuthProvider>');
  return context;
}
