import { create } from 'zustand';
import { api } from '../api/axios';
import { useAlerts } from './alerts';

const showAlert = (payload: any) => useAlerts.getState().showAlert(payload);

export type MenuItem = {
  menu_item_id: string;
  menu_id: string;
  parent_id: string | null;
  label: string;
  url: string | null;
  content_id: string | null;
  external_url: string | null;
  order_index: number;
  status: boolean;
  children?: MenuItem[];
};

export type Menu = {
  menu_id: string;
  code: string;
  name: string;
  status: boolean;
  created_at: string;
  updated_at: string;
  items?: MenuItem[];
};

type MenusState = {
  items: Menu[];
  selected: Menu | null;
  loading: boolean;
  error: string | null;

  fetchMenus: () => Promise<void>;
  fetchMenuById: (id: string) => Promise<void>;
  createMenu: (data: { code: string; name: string; status?: boolean }) => Promise<Menu>;
  updateMenu: (id: string, data: Partial<Menu>) => Promise<Menu>;
  deleteMenu: (id: string) => Promise<void>;
  clearSelected: () => void;
};

export const useMenus = create<MenusState>((set, get) => ({
  items: [],
  selected: null,
  loading: false,
  error: null,

  clearSelected: () => set({ selected: null }),

  fetchMenus: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/menus');
      set({ items: res.data.items || [], loading: false });
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? 'Nie udało się pobrać menu';
      set({ error: msg, loading: false });
      throw e;
    }
  },

  fetchMenuById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/menus/${id}`);
      set({ selected: res.data.menu, loading: false });
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? 'Nie udało się pobrać menu';
      set({ error: msg, loading: false });
      throw e;
    }
  },

  createMenu: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/menus', data);
      const created = res.data.menu;
      set({ items: [...get().items, created], loading: false });
      showAlert({
        variant: 'success',
        title: 'Utworzono menu',
        message: 'Menu zostało pomyślnie utworzone',
        duration: 3000,
      });
      return created;
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? 'Nie udało się utworzyć menu';
      set({ error: msg, loading: false });
      showAlert({ variant: 'error', title: 'Błąd', message: msg, duration: 5000 });
      throw e;
    }
  },

  updateMenu: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const res = await api.put(`/menus/${id}`, data);
      const updated = res.data.menu;
      set({
        items: get().items.map((m) => (m.menu_id === id ? updated : m)),
        loading: false,
      });
      showAlert({
        variant: 'success',
        title: 'Zaktualizowano',
        message: 'Menu zostało zaktualizowane',
        duration: 3000,
      });
      return updated;
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? 'Nie udało się zaktualizować menu';
      set({ error: msg, loading: false });
      throw e;
    }
  },

  deleteMenu: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/menus/${id}`);
      set({ items: get().items.filter((m) => m.menu_id !== id), loading: false });
      showAlert({
        variant: 'success',
        title: 'Usunięto',
        message: 'Menu zostało usunięte',
        duration: 3000,
      });
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? 'Nie udało się usunąć menu';
      set({ error: msg, loading: false });
      showAlert({ variant: 'error', title: 'Błąd', message: msg, duration: 5000 });
      throw e;
    }
  },
}));
