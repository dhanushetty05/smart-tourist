import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    const { access_token, user: userData } = response.data;
    
    setUser(userData);
    setToken(access_token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', access_token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    
    return userData;
  };

  const register = async (email, password, name, role = 'tourist') => {
    const response = await axios.post(`${API_URL}/auth/register`, { email, password, name, role });
    const { access_token, user: userData } = response.data;
    
    setUser(userData);
    setToken(access_token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', access_token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    
    return userData;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'police' || user?.role === 'tourism_officer',
    isTourist: user?.role === 'tourist'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};