import React, { createContext, useContext, useEffect, useState } from 'react';
import { me } from '../api/auth';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem('tt_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await me();
        setUser(data);
      } catch (err) {
        console.warn('Invalid token or failed to fetch profile', err);
        localStorage.removeItem('tt_token');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const login = (token, userObj) => {
    localStorage.setItem('tt_token', token);
    setUser(userObj);
    // refresh route to pick up teams etc
    nav('/onboarding');
  };

  const logout = () => {
    localStorage.removeItem('tt_token');
    setUser(null);
    nav('/login');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
