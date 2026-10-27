import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('amber_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize user profile on load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('amber_token');
      if (storedToken) {
        try {
          const res = await api.getMe();
          setUser(res.user);
        } catch (err) {
          console.error('Session expired or invalid:', err.message);
          localStorage.removeItem('amber_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    localStorage.setItem('amber_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    localStorage.setItem('amber_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('amber_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      setUser(res.user);
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  };

  // Quick 1-click role switcher for seamless evaluation
  const switchDemoUser = async (roleKey) => {
    const demoAccounts = {
      roaster: { email: 'roaster@amberroast.io', password: 'password123' },
      buyer: { email: 'buyer@amberroast.io', password: 'password123' },
      qgrader: { email: 'qgrader@amberroast.io', password: 'password123' },
      admin: { email: 'admin@amberroast.io', password: 'password123' },
    };

    const target = demoAccounts[roleKey];
    if (target) {
      return await login(target.email, target.password);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        switchDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
