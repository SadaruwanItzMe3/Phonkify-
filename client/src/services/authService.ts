import { api } from './api';
import type { User } from '@/types';

interface AuthResponse {
  success: boolean;
  user: User;
  accessToken: string;
}

export const authService = {
  register: (username: string, email: string, password: string) =>
    api.post<AuthResponse>('/auth/register', { username, email, password }).then((r) => r.data),

  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data),

  googleSignIn: (idToken: string) =>
    api.post<AuthResponse>('/auth/google', { idToken }).then((r) => r.data),

  refresh: () => api.post<{ success: boolean; accessToken: string }>('/auth/refresh').then((r) => r.data),

  logout: () => api.post('/auth/logout'),
};
