import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

// Mock users for development — replace login() body with real API call later
const MOCK_USERS = {
  'customer@test.com':  { name: 'Alex Johnson',    email: 'customer@test.com',  role: 'customer'  },
  'wholesale@test.com': { name: 'Metro Beauty Co', email: 'wholesale@test.com', role: 'wholesale' },
  'staff@test.com':     { name: 'Staff Member',    email: 'staff@test.com',     role: 'staff'     },
  'admin@test.com':     { name: 'Admin User',      email: 'admin@test.com',     role: 'admin'     },
};

const STORAGE_KEY = 'gp_auth_user';

const ROLE_REDIRECTS = {
  customer:  '/profile',
  wholesale: '/wholesale',
  staff:     '/staff',
  admin:     '/admin',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    // --- Replace this block with: const res = await fetch('/api/auth/login', {...}) ---
    const mock = MOCK_USERS[email.toLowerCase().trim()];
    if (!mock || !password) throw new Error('Invalid email or password');
    // --- End of mock block ---

    localStorage.setItem(STORAGE_KEY, JSON.stringify(mock));
    setUser(mock);
    return mock;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role ?? null,
      isLoading,
      login,
      logout,
      roleRedirect: ROLE_REDIRECTS,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
