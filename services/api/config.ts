// API Configuration

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

export const config = {
  apiUrl: API_BASE_URL,
  wsUrl: WS_URL,
};

// Get auth token from localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Set auth token in localStorage
export const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

// Remove auth token from localStorage
export const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
};

// Set current user in localStorage
export const setCurrentUser = (user: any): void => {
  localStorage.setItem('currentUser', JSON.stringify(user));
};

// Remove current user from localStorage
export const removeCurrentUser = (): void => {
  localStorage.removeItem('currentUser');
};
