import { create } from "zustand";
import { api } from "../api/axios";

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

export type UpdateMePayload = {
  display_name?: string;
  email?: string;
  current_password?: string;
  new_password?: string;
};

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;

  updateMe: (data: UpdateMePayload) => Promise<void>;
  updatingMe: boolean;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,
  updatingMe: false,

  clearError: () => set({ error: null }),

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/auth/login", { email, password });
      set({ user: res.data.user, loading: false });
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? "Login failed";
      set({ error: msg, loading: false });
      throw e;
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      set({ user: null });
    }
  },

  checkAuth: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/auth/check");
      set({ user: res.data.user ?? null, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  updateMe: async (data: UpdateMePayload) => {
    set({ updatingMe: true, error: null });
    try {
      const res = await api.put("/users/me", data);
      const updatedUser = res.data.user ?? null;
      set({ user: updatedUser, updatingMe: false });
    } catch (e: any) {
      const msg =
        e?.response?.data?.error ??
        "Nie udało się zaktualizować danych użytkownika";
      set({ error: msg, updatingMe: false });
      throw e;
    }
  },
}));
