import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setSession: (user: User, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

/**
 * Note: this store intentionally does NOT import the api client (services/api.ts)
 * to avoid a circular dependency — api.ts reads the access token from this store
 * on every request. Auth network calls live in services/authService.ts instead.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setSession: (user, accessToken) => set({ user, accessToken, isAuthenticated: true }),
      setAccessToken: (accessToken) => set({ accessToken, isAuthenticated: true }),
      setUser: (user) => set({ user }),
      logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: 'phonkify-auth',
      // Never persist the raw access token to storage long-term beyond session;
      // it's short-lived and re-fetched via the refresh-token cookie on load.
      partialize: (state) => ({ user: state.user }),
    }
  )
);
