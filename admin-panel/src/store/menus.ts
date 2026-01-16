import { create } from 'zustand'
import { api } from '../api/axios'
import { useAlerts } from './alerts'

const showAlert = (payload: any) => useAlerts.getState().showAlert(payload)

export interface User {
  user_id: string
  display_name: string
  email: string
}

export type MenuItem = {
  menu_item_id: string
  menu_id: string
  parent_id: string | null
  label: string
  url: string | null
  content_id: string | null
  external_url: string | null
  order_index: number
  status: boolean
  children?: MenuItem[]
}

export type Menu = {
  menu_id: string
  code: string
  name: string
  status: boolean
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
  creator?: User | null
  updater?: User | null
  items?: MenuItem[]
}

type MenusState = {
  items: Menu[]
  selected: Menu | null
  loading: boolean
  error: string | null
  total: number

  fetchMenus: (params?: {
    search?: string
    status?: boolean
    created_by?: string
    updated_by?: string
    created_from?: string
    created_to?: string
    updated_from?: string
    updated_to?: string
    limit?: number
    offset?: number
  }) => Promise<void>
  fetchMenuById: (id: string) => Promise<void>
  createMenu: (data: {
    code: string
    name: string
    status?: boolean
  }) => Promise<Menu>
  updateMenu: (id: string, data: Partial<Menu>) => Promise<Menu>
  deleteMenu: (id: string) => Promise<void>
  clearSelected: () => void
}

export const useMenus = create<MenusState>((set, get) => ({
  items: [],
  selected: null,
  loading: false,
  error: null,
  total: 0,

  clearSelected: () => set({ selected: null }),

  fetchMenus: async (params) => {
    set({ loading: true, error: null })
    try {
      const res = await api.get('/menus', { params })
      set({
        items: res.data.items || [],
        total: res.data.total || 0,
        loading: false,
      })
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? 'Nie udało się pobrać menu'
      set({ error: msg, loading: false })
      throw e
    }
  },

  fetchMenuById: async (id) => {
    set({ loading: true, error: null })
    try {
      const res = await api.get(`/menus/${id}`)
      set({ selected: res.data, loading: false })
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? 'Nie udało się pobrać menu'
      set({ error: msg, loading: false })
      throw e
    }
  },

  createMenu: async (data) => {
    set({ loading: true, error: null })
    try {
      const res = await api.post('/menus', data)
      const created = res.data
      set({ loading: false })
      showAlert({
        variant: 'success',
        title: 'Utworzono menu',
        message: 'Menu zostało pomyślnie utworzone',
        duration: 3000,
      })
      return created
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? 'Nie udało się utworzyć menu'
      set({ error: msg, loading: false })
      showAlert({
        variant: 'error',
        title: 'Błąd',
        message: msg,
        duration: 5000,
      })
      throw e
    }
  },

  updateMenu: async (id, data) => {
    set({ error: null })
    try {
      const res = await api.put(`/menus/${id}`, data)
      const updated = res.data
      showAlert({
        variant: 'success',
        title: 'Zaktualizowano',
        message: 'Menu zostało zaktualizowane',
        duration: 3000,
      })
      return updated
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? 'Nie udało się zaktualizować menu'
      set({ error: msg })
      showAlert({
        variant: 'error',
        title: 'Błąd',
        message: msg,
        duration: 5000,
      })
      throw e
    }
  },

  deleteMenu: async (id) => {
    set({ loading: true, error: null })
    try {
      await api.delete(`/menus/${id}`)
      set({ loading: false })
      showAlert({
        variant: 'success',
        title: 'Usunięto',
        message: 'Menu zostało usunięte',
        duration: 3000,
      })
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? 'Nie udało się usunąć menu'
      set({ error: msg, loading: false })
      showAlert({
        variant: 'error',
        title: 'Błąd',
        message: msg,
        duration: 5000,
      })
      throw e
    }
  },
}))
