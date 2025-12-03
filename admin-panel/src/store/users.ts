// src/store/users.ts
import { create } from 'zustand';
import { api } from '../api/axios';

export type Role = {
  role_id: string;
  display_name: string;
  type?: string;
  created_at?: string;
  updated_at?: string;
};

export type User = {
  user_id: string;
  email: string;
  display_name?: string | null;
  role_id?: string | null;
  role?: Role;
  last_access?: string | null;
  status?: boolean;
  created_at?: string;
  updated_at?: string;
  avatar_url?: string | null;
};

export type NewUserPayload = {
  email: string;
  display_name?: string;
  role_id?: string;
  status?: boolean;
};

export type UpdateUserPayload = {
  email?: string;
  display_name?: string;
  role_id?: string;
  status?: boolean;
};

type UsersState = {
  users: User[];
  selectedUser: User | null;
  loading: boolean;
  error: string | null;

  fetchUsers: () => Promise<void>;
  fetchUser: (id: string) => Promise<void>;
  addUser: (data: NewUserPayload) => Promise<User>;
  updateUser: (id: string, data: UpdateUserPayload) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;

  clearError: () => void;
  clearSelected: () => void;
};

export const useUsers = create<UsersState>((set, get) => ({
  users: [],
  selectedUser: null,
  loading: false,
  error: null,

  clearError: () => set({ error: null }),
  clearSelected: () => set({ selectedUser: null }),

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/users');
      set({ users: res.data.users ?? [], loading: false });
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? 'Nie udało się pobrać użytkowników';
      set({ error: msg, loading: false });
      throw e;
    }
  },

  fetchUser: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/users/${id}`);
      set({ selectedUser: res.data.user ?? null, loading: false });
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? 'Nie udało się pobrać użytkownika';
      set({ error: msg, loading: false });
      throw e;
    }
  },

  addUser: async (data: NewUserPayload) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/users/add', data);
      const created: User = res.data.user;
      const current = get().users;
      set({ users: [...current, created], loading: false });
      return created;
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? 'Nie udało się dodać użytkownika';
      set({ error: msg, loading: false });
      throw e;
    }
  },

  updateUser: async (id: string, data: any) => {
    set({ loading: true, error: null });
    try {
      const res = await api.put(`/users/${id}`, data);
      const updated: User = res.data.user;

      const current = get().users;
      set({
        users: current.map((u) => (u.user_id === id ? updated : u)),
        loading: false,
      });

      return updated;
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? 'Nie udało się zaktualizować użytkownika';
      set({ error: msg, loading: false });
      throw e;
    }
  },

  deleteUser: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/users/${id}`);

      const current = get().users;
      set({
        users: current.filter((u) => u.user_id !== id),
        loading: false,
      });
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? 'Nie udało się usunąć użytkownika';
      set({ error: msg, loading: false });
      throw e;
    }
  },
}));
