import { create } from 'zustand'
import { api } from '../api/axios'
import { useAlerts, type AlertPayload } from './alerts'

type User = {
    user_id: string
    email: string
    role: Role
    display_name?: string
    last_access?: string
    avatar_url?: string | null
    permissions?: string[]
}

type Role = {
    role_id: string
    display_name: string
    type?: string
    created_at?: string
    updated_at?: string
}

export type UpdateMePayload = {
    display_name?: string
    email?: string
    current_password?: string
    new_password?: string
}

type AuthState = {
    user: User | null
    loading: boolean
    error: string | null
    login: (
        email: string,
        password: string,
        keepSignedIn: boolean
    ) => Promise<void>
    logout: () => Promise<void>
    checkAuth: () => Promise<void>
    clearError: () => void

    updateMe: (data: UpdateMePayload) => Promise<void>
    updatingMe: boolean
    avatarLoading: boolean
    uploadAvatar: (file: File) => Promise<void>
    deleteAvatar: () => Promise<void>
    forgotPassword: (email: string) => Promise<void>
    resetPassword: (token: string, newPassword: string) => Promise<void>
}

const showAlert = (payload: AlertPayload) => {
    useAlerts.getState().showAlert(payload)
}

export const useAuth = create<AuthState>((set) => ({
    user: null,
    loading: true,
    error: null,
    updatingMe: false,
    avatarLoading: false,

    clearError: () => set({ error: null }),

    login: async (email, password, keepSignedIn) => {
        set({ loading: true, error: null })
        try {
            const res = await api.post('/auth/login', {
                email,
                password,
                keepSignedIn,
            })
            set({ user: res.data.user, loading: false })
        } catch (e: any) {
            const msg = e?.response?.data?.error ?? 'Login failed'
            showAlert({
                variant: 'error',
                title: 'Błąd logowania',
                message: msg,
                duration: 5000,
            })
            set({ error: msg, loading: false })
            throw e
        }
    },

    logout: async () => {
        try {
            await api.post('/auth/logout')
        } finally {
            set({ user: null })
        }
    },

    checkAuth: async () => {
        set({ loading: true })
        try {
            const res = await api.get('/auth/check')
            set({ user: res.data.user ?? null, loading: false })
        } catch {
            set({ user: null, loading: false })
        }
    },

    updateMe: async (data: UpdateMePayload) => {
        set({ updatingMe: true, error: null })
        try {
            const res = await api.put('/users/me', data)
            const updatedUser = res.data.user ?? null
            set({ user: updatedUser, updatingMe: false })
            showAlert({
                variant: 'success',
                title: 'Zaktualizowano dane',
                message: 'Twoje dane zostały pomyślnie zaktualizowane.',
                duration: 3000,
            })
        } catch (e: any) {
            const msg =
                e?.response?.data?.error ??
                'Nie udało się zaktualizować danych użytkownika'
            set({ error: msg, updatingMe: false })
            showAlert({
                variant: 'error',
                title: 'Błąd',
                message: msg,
                duration: 5000,
            })
            throw e
        }
    },

    uploadAvatar: async (file: File) => {
        set({ avatarLoading: true, error: null })
        try {
            const formData = new FormData()
            formData.append('avatar', file)

            const res = await api.post('/users/me/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })

            const updatedUser = res.data.user ?? null
            set({ user: updatedUser, avatarLoading: false })
            showAlert({
                variant: 'success',
                title: 'Zaktualizowano zdjęcie profilowe',
                message:
                    'Twoje zdjęcie profilowe zostało pomyślnie zaktualizowane.',
                duration: 3000,
            })
        } catch (e: any) {
            const msg =
                e?.response?.data?.error ??
                'Nie udało się zaktualizować zdjęcia profilowego'
            set({ error: msg, avatarLoading: false })
            showAlert({
                variant: 'error',
                title: 'Błąd',
                message: msg,
                duration: 5000,
            })
            throw e
        }
    },

    deleteAvatar: async () => {
        set({ avatarLoading: true, error: null })
        try {
            const res = await api.delete('/users/me/avatar')
            const updatedUser = res.data.user ?? null
            set({ user: updatedUser, avatarLoading: false })
            showAlert({
                variant: 'success',
                title: 'Usunięto zdjęcie profilowe',
                message: 'Twoje zdjęcie profilowe zostało pomyślnie usunięte.',
                duration: 3000,
            })
        } catch (e: any) {
            const msg =
                e?.response?.data?.error ??
                'Nie udało się usunąć zdjęcia profilowego'
            set({ error: msg, avatarLoading: false })
            showAlert({
                variant: 'error',
                title: 'Błąd',
                message: msg,
                duration: 5000,
            })
            throw e
        }
    },

    forgotPassword: async (email: string) => {
        set({ loading: true, error: null })
        try {
            await api.post('/auth/forgot-password', { email })
            showAlert({
                variant: 'success',
                title: 'Mail resetujący wysłany',
                message:
                    'Jeśli konto z podanym adresem e-mail istnieje, wysłaliśmy maila z instrukcjami resetu hasła.',
                duration: 5000,
            })
        } catch (e: any) {
            const msg =
                e?.response?.data?.error ??
                'Nie udało się wysłać maila resetującego'
            set({ error: msg })
            showAlert({
                variant: 'error',
                title: 'Błąd',
                message: msg,
                duration: 5000,
            })
            throw e
        } finally {
            set({ loading: false })
        }
    },

    resetPassword: async (token: string, newPassword: string) => {
        set({ loading: true, error: null })
        try {
            await api.post('/auth/reset-password', { token, newPassword })
            showAlert({
                variant: 'success',
                title: 'Hasło zresetowane',
                message:
                    'Twoje hasło zostało pomyślnie zresetowane. Możesz się teraz zalogować.',
                duration: 5000,
            })
        } catch (e: any) {
            const msg =
                e?.response?.data?.error ?? 'Nie udało się zresetować hasła'
            set({ error: msg })
            showAlert({
                variant: 'error',
                title: 'Błąd',
                message: msg,
                duration: 5000,
            })
            throw e
        } finally {
            set({ loading: false })
        }
    },
}))
