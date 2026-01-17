'use client'

import Cookies from 'js-cookie';
import api from './api';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
}

export const login = async (email: string, password: string) => {
  const { default: api } = await import('./api');

  const response = await api.post('/auth/login', { email, password });
  const { token, refreshToken, user } = response.data;

  Cookies.set('token', token, { 
    expires: 7,
    sameSite: 'Lax',
    secure: false 
  });

  Cookies.set('refreshToken', refreshToken, { 
    expires: 30,
    sameSite: 'Lax',
    secure: false
  });

  return user;
};

export const register = async (data: {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
}) => {
  const { default: api } = await import('./api');

  const response = await api.post('/auth/register', data);
  const { token, refreshToken, user } = response.data;

  Cookies.set('token', token, { 
    expires: 7,
    sameSite: 'Lax',
    secure: false
  });

  Cookies.set('refreshToken', refreshToken, { 
    expires: 30,
    sameSite: 'Lax',
    secure: false
  });

  return user;
};

export const logout = () => {
  Cookies.remove('token');
  Cookies.remove('refreshToken');
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { default: api } = await import('./api');
    const response = await api.get('/auth/profile');
    return response.data.user;
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return !!Cookies.get('token');
};