// Authentication API Service

import { apiClient } from './client';
import { setAuthToken, setCurrentUser, removeAuthToken, removeCurrentUser } from './config';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  teamId?: string;
}

export const authService = {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data, {
      requireAuth: false,
    });

    // Store token and user
    setAuthToken(response.token);
    setCurrentUser(response.user);

    return response;
  },

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data, {
      requireAuth: false,
    });

    // Store token and user
    setAuthToken(response.token);
    setCurrentUser(response.user);

    return response;
  },

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  },

  /**
   * Logout user
   */
  logout(): void {
    removeAuthToken();
    removeCurrentUser();
  },
};
