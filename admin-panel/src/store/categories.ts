import { create } from 'zustand';
import { api } from '../api/axios';
import { useAlerts } from './alerts';

const showAlert = (payload: any) => useAlerts.getState().showAlert(payload);

export type Category = {
  category_id: string;
  display_name: string;
  slug: string;
  status: boolean;
  created_at: string;
  updated_at: string;
};

type CategoriesState = {
  items: Category[];
  selected: Category | null;
  loading: boolean;
  error: string | null;

  fetchCategories: () => Promise<void>;
  fetchCategoryById: (id: string) => Promise<void>;
  createCategory: (data: {
    display_name: string;
    slug: string;
    status?: boolean;
  }) => Promise<Category>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  clearSelected: () => void;
};

export const useCategories = create<CategoriesState>((set, get) => ({
  items: [],
  selected: null,
  loading: false,
  error: null,

  clearSelected: () => set({ selected: null }),

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/categories');
      set({ items: res.data.items || [], loading: false });
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? 'Nie udało się pobrać kategorii';
      set({ error: msg, loading: false });
      throw e;
    }
  },

  fetchCategoryById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/categories/${id}`);
      set({ selected: res.data.category, loading: false });
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? 'Nie udało się pobrać kategorii';
      set({ error: msg, loading: false });
      throw e;
    }
  },

  createCategory: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/categories', data);
      const created = res.data.category;
      set({ items: [...get().items, created], loading: false });
      showAlert({
        variant: 'success',
        title: 'Utworzono kategorię',
        message: 'Kategoria została pomyślnie utworzona',
        duration: 3000,
      });
      return created;
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? 'Nie udało się utworzyć kategorii';
      set({ error: msg, loading: false });
      showAlert({ variant: 'error', title: 'Błąd', message: msg, duration: 5000 });
      throw e;
    }
  },

  updateCategory: async (id, data) => {
    set({ error: null });

    const oldCategory = get().items.find((c) => c.category_id === id);
    if (!oldCategory) {
      throw new Error('Category not found');
    }

    set({
      items: get().items.map((c) =>
        c.category_id === id ? { ...c, ...data } : c
      ),
    });

    try {
      const res = await api.put(`/categories/${id}`, data);
      const updated = res.data;

      set({
        items: get().items.map((c) => (c.category_id === id ? updated : c)),
      });

      showAlert({
        variant: 'success',
        title: 'Zaktualizowano',
        message: 'Kategoria została zaktualizowana',
        duration: 3000,
      });

      return updated;
    } catch (e: any) {
      set({
        items: get().items.map((c) => (c.category_id === id ? oldCategory : c)),
      });

      const msg = e?.response?.data?.error ?? 'Nie udało się zaktualizować kategorii';
      set({ error: msg });
      showAlert({ variant: 'error', title: 'Błąd', message: msg, duration: 5000 });
      throw e;
    }
  },

  deleteCategory: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/categories/${id}`);
      set({ items: get().items.filter((c) => c.category_id !== id), loading: false });
      showAlert({
        variant: 'success',
        title: 'Usunięto',
        message: 'Kategoria została usunięta',
        duration: 3000,
      });
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? 'Nie udało się usunąć kategorii';
      set({ error: msg, loading: false });
      showAlert({ variant: 'error', title: 'Błąd', message: msg, duration: 5000 });
      throw e;
    }
  },
}));