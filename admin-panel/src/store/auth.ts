import { create } from 'zustand';
import { api } from '../api/axios';

type User = {
  user_id: string;
  email: string;
  role: Role;
  display_name?: string;
  last_access?: string;
};

type Role = {
  role_id: string;
  display_name: string;
  type?: string;
  created_at?: string;
  updated_at?: string;
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
  loading: true,
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
