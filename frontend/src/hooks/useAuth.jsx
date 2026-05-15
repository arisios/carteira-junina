import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('cw_token');
    const s = localStorage.getItem('cw_user');
    if (t && s) try { setUser(JSON.parse(s)); } catch { localStorage.removeItem('cw_token'); }
    setLoading(false);
  }, []);

  const persist = (data) => {
    localStorage.setItem('cw_token', data.token);
    localStorage.setItem('cw_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const login = async (identifier, password) => {
    const { data } = await api.post('/auth/login', { identifier, password });
    return persist(data);
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    return persist(data);
  };

  const logout = () => {
    localStorage.removeItem('cw_token');
    localStorage.removeItem('cw_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
