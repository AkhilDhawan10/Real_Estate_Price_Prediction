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
  const response = await api.post('/auth/login', { email, password });
  const { token, refreshToken, user } = response.data;
  
  // Set cookies with proper options for localhost
  Cookies.set('token', token, { 
    expires: 7,
    sameSite: 'Lax',
    secure: false // Allow http for localhost
  });
  Cookies.set('refreshToken', refreshToken, { 
    expires: 30,
    sameSite: 'Lax',
    secure: false
  });
  
  console.log('✅ Token stored in cookies:', {
    token: token.substring(0, 20) + '...',
    cookieSet: !!Cookies.get('token')
  });
  
  return user;
};

export const register = async (data: {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
}) => {
  const response = await api.post('/auth/register', data);
  const { token, refreshToken, user } = response.data;
  
  // Set cookies with proper options for localhost
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
  window.location.href = '/login';
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await api.get('/auth/profile');
    return response.data.user;
  } catch (error) {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return !!Cookies.get('token');
};

