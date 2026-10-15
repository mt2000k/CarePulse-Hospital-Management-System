import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hms_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('hms_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('hms_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Session verification failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('hms_token', newToken);
      localStorage.setItem('hms_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return userData;
    }
  };

  const register = async (patientData) => {
    const res = await api.post('/auth/register', patientData);
    if (res.data.success) {
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('hms_token', newToken);
      localStorage.setItem('hms_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return userData;
    }
  };

  const updateProfile = async (formData) => {
    const res = await api.put('/auth/profile', formData);
    if (res.data.success) {
      const updatedUser = res.data.user;
      setUser(updatedUser);
      localStorage.setItem('hms_user', JSON.stringify(updatedUser));
      return updatedUser;
    }
  };

  const logout = () => {
    localStorage.removeItem('hms_token');
    localStorage.removeItem('hms_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
