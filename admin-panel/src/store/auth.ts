import { create } from 'zustand';
import { api } from '../api/axios';

type User = {
  id: string;
  email: string;
  role: string;
};

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      set({ user: res.data.user, loading: false });
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? 'Login failed';
      set({ error: msg, loading: false });
      throw e;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      set({ user: null });
    }
  },

  checkAuth: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/auth/check');
      set({ user: res.data.user ?? null, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
}));
