import React, { createContext, useContext, useEffect, useState } from 'react';
import { getProfile } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedRole = localStorage.getItem('role');
      const storedUser = localStorage.getItem('user') || localStorage.getItem('userId');

      if (storedToken) {
        // Validate token by trying to fetch profile
        try {
          await getProfile();
          // If successful, token is valid
          setToken(storedToken);
          if (storedRole) setRole(storedRole);
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch (e) {
              setUser(storedUser);
            }
          }
        } catch (error) {
          // Token is invalid, clear localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('user');
          localStorage.removeItem('userId');
          console.log('Invalid token, cleared auth data');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (newToken, newRole, data = null) => {
    setToken(newToken);
    setRole(newRole);
    setUser(data || null);

    localStorage.setItem('token', newToken);
    localStorage.setItem('role', newRole);
    if (data) {
      try {
        localStorage.setItem('user', JSON.stringify(data));
      } catch (e) {
        localStorage.setItem('user', data);
      }
    }
    // keep compatibility with older code that reads userId
    if (data && data.userId) localStorage.setItem('userId', data.userId);
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
  };

  const value = {
    token,
    role,
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export default AuthContext;
