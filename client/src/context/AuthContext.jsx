import { createContext, useState, useEffect, useCallback } from 'react';
import { api, setToken, clearToken } from '../lib/api';

export const AuthContext = createContext(null);

const ROLE_REDIRECTS = {
  customer:  '/profile',
  wholesale: '/wholesale',
  staff:     '/admin',
  admin:     '/admin',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: try to restore session using the httpOnly refresh cookie.
  // If the cookie is still valid the server issues a new access token.
  useEffect(() => {
    const restore = async () => {
      try {
        const data = await api.auth('/auth/refresh', {});
        setToken(data.accessToken);
        const me = await api.get('/auth/me');
        setUser(me.user);
      } catch {
        // No valid session — user stays logged out
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, []);

  // ── login ──────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const data = await api.auth('/auth/login', { email, password });
    setToken(data.accessToken);
    setUser(data.user);
    return data.user;
  };

  // ── register ───────────────────────────────────────────────────────────
  const register = async ({ name, email, password, phone = '' }) => {
    const data = await api.auth('/auth/register', { name, email, password, phone });
    setToken(data.accessToken);
    setUser(data.user);
    return data.user;
  };

  // ── refresh the current user from the server (e.g. after profile changes) ─
  const refreshUser = useCallback(async () => {
    try {
      const me = await api.get('/auth/me');
      setUser(me.user);
      return me.user;
    } catch {
      return null;
    }
  }, []);

  // ── wholesale application (auto-logs in as customer w/ pending app) ──────
  const applyWholesale = async (payload) => {
    const data = await api.auth('/auth/wholesale-apply', payload);
    if (data.accessToken) {
      setToken(data.accessToken);
      setUser(data.user);
    }
    return data;
  };

  // ── logout ─────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout', {});
    } catch { /* always clear locally even if server call fails */ }
    clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      role:         user?.role ?? null,
      isLoading,
      login,
      register,
      applyWholesale,
      refreshUser,
      logout,
      roleRedirect: ROLE_REDIRECTS,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
