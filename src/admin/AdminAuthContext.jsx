import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ApiError, api, getToken, request, setToken } from './api';

/**
 * Sign-in for the admin area. It uses the backend's email + password accounts (role admin or staff),
 * which are separate from the storefront's mobile-OTP customer login.
 */
const AdminAuthContext = createContext(null);

const TEAM_ROLES = ['admin', 'staff'];

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(getToken() ? 'checking' : 'signed-out'); // checking | signed-in | signed-out

  // Restore the session from a saved token
  useEffect(() => {
    if (!getToken()) return undefined;
    let cancelled = false;
    api('/auth/me')
      .then(({ user: me }) => {
        if (cancelled) return;
        if (!TEAM_ROLES.includes(me.role)) throw new ApiError('Not a team account', { status: 403 });
        setUser(me);
        setStatus('signed-in');
      })
      .catch(() => {
        if (cancelled) return;
        setToken(null);
        setStatus('signed-out');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // The API client fires this when the backend rejects the token
  useEffect(() => {
    const onSignedOut = () => {
      setUser(null);
      setStatus('signed-out');
    };
    window.addEventListener('admin:signed-out', onSignedOut);
    return () => window.removeEventListener('admin:signed-out', onSignedOut);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await request('/auth/login', { method: 'POST', body: { email, password }, auth: false });
    if (!TEAM_ROLES.includes(data.user.role)) {
      throw new ApiError('This account does not have access to the admin area.', { status: 403, code: 'NOT_TEAM' });
    }
    setToken(data.token);
    setUser(data.user);
    setStatus('signed-in');
    return data.user;
  }, []);

  const logout = useCallback(() => {
    // Backend sessions are stateless: signing out means forgetting the token
    request('/auth/logout', { method: 'POST' }).catch(() => {});
    setToken(null);
    setUser(null);
    setStatus('signed-out');
  }, []);

  const value = useMemo(() => ({ user, status, isAdmin: user?.role === 'admin', login, logout }), [user, status, login, logout]);
  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  return ctx;
};
