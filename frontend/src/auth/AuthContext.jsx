import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosInstance';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [twoFactorPending, setTwoFactorPending] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/login', { email, password });

    // If 2FA is required, return the challenge info
    if (data.two_factor_required) {
      setTwoFactorPending(data);
      return { twoFactorRequired: true };
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const verifyTwoFactor = async (code) => {
    if (!twoFactorPending) throw new Error('No 2FA challenge pending');

    const { data } = await api.post('/two-factor/verify', {
      user_id: twoFactorPending.two_factor_user_id,
      code,
    });

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    setTwoFactorPending(null);
    return data.user;
  };

  const cancelTwoFactor = () => {
    setTwoFactorPending(null);
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch {
      // Ignore errors during logout
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (typeof roles === 'string') return user.role === roles;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole, twoFactorPending, verifyTwoFactor, cancelTwoFactor }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
