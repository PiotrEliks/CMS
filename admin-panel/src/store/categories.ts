import { create } from 'zustand'
import { api } from '../api/axios'
import { useAlerts } from './alerts'

const showAlert = (payload: any) => useAlerts.getState().showAlert(payload)

export interface User {
    user_id: string
    display_name: string
    email: string
}

export type Category = {
    category_id: string
    display_name: string
    slug: string
    status: boolean
    type: string | null
    path: string | null
    created_by: string | null
    updated_by: string | null
    created_at: string
    updated_at: string
    creator?: User | null
    updater?: User | null
}

type CategoriesState = {
    items: Category[]
    selected: Category | null
    loading: boolean
    error: string | null
    total: number

    fetchCategories: (params?: {
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
    fetchCategoryById: (id: string) => Promise<void>
    createCategory: (data: {
        display_name: string
        slug: string
        status?: boolean
        type?: string
        path?: string
    }) => Promise<Category>
    updateCategory: (id: string, data: Partial<Category>) => Promise<Category>
    deleteCategory: (id: string) => Promise<void>
    clearSelected: () => void
}

export const useCategories = create<CategoriesState>((set, get) => ({
    items: [],
    selected: null,
    loading: false,
    error: null,
    total: 0,

    clearSelected: () => set({ selected: null }),

    fetchCategories: async (params) => {
        set({ loading: true, error: null })
        try {
            const res = await api.get('/categories', { params })
            set({
                items: res.data.items || [],
                total: res.data.total || 0,
                loading: false,
            })
        } catch (e: any) {
            const msg =
                e?.response?.data?.error ?? 'Nie udało się pobrać kategorii'
            set({ error: msg, loading: false })
            throw e
        }
    },

    fetchCategoryById: async (id) => {
        set({ loading: true, error: null })
        try {
            const res = await api.get(`/categories/${id}`)
            set({ selected: res.data, loading: false })
        } catch (e: any) {
            const msg =
                e?.response?.data?.error ?? 'Nie udało się pobrać kategorii'
            set({ error: msg, loading: false })
            throw e
        }
    },

    createCategory: async (data) => {
        set({ loading: true, error: null })
        try {
            const res = await api.post('/categories', data)
            const created = res.data
            set({ loading: false })
            showAlert({
                variant: 'success',
                title: 'Utworzono kategorię',
                message: 'Kategoria została pomyślnie utworzona',
                duration: 3000,
            })
            return created
        } catch (e: any) {
            const msg =
                e?.response?.data?.error ?? 'Nie udało się utworzyć kategorii'
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

    updateCategory: async (id, data) => {
        set({ error: null })

        try {
            const res = await api.put(`/categories/${id}`, data)
            const updated = res.data

            showAlert({
                variant: 'success',
                title: 'Zaktualizowano',
                message: 'Kategoria została zaktualizowana',
                duration: 3000,
            })

            return updated
        } catch (e: any) {
            const msg =
                e?.response?.data?.error ??
                'Nie udało się zaktualizować kategorii'
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

    deleteCategory: async (id) => {
        set({ loading: true, error: null })
        try {
            await api.delete(`/categories/${id}`)
            set({ loading: false })
            showAlert({
                variant: 'success',
                title: 'Usunięto',
                message: 'Kategoria została usunięta',
                duration: 3000,
            })
        } catch (e: any) {
            const msg =
                e?.response?.data?.error ?? 'Nie udało się usunąć kategorii'
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
