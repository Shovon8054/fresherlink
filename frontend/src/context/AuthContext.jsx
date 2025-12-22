import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // initialize from localStorage
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    const storedUser = localStorage.getItem('user') || localStorage.getItem('userId');

    if (storedToken) setToken(storedToken);
    if (storedRole) setRole(storedRole);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        // storedUser might be a primitive id string
        setUser(storedUser);
      }
    }
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
