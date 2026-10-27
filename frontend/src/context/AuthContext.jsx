import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('goldencrust_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('goldencrust_token');
      if (storedToken) {
        try {
          const res = await api.getMe();
          setUser(res.user);
        } catch (err) {
          console.error('Session expired:', err.message);
          localStorage.removeItem('goldencrust_token');
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
    localStorage.setItem('goldencrust_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    localStorage.setItem('goldencrust_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('goldencrust_token');
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

  // Quick 1-click persona switcher for evaluators
  const switchDemoUser = async (roleKey) => {
    const demoAccounts = {
      customer: { email: 'customer@goldencrust.com', password: 'password123' },
      baker: { email: 'baker@goldencrust.com', password: 'password123' },
      admin: { email: 'admin@goldencrust.com', password: 'password123' },
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
