import { create } from 'zustand'
import { api } from '../api/axios'
import { useAlerts, type AlertPayload } from './alerts'

const showAlert = (payload: AlertPayload) =>
    useAlerts.getState().showAlert(payload)

export type MediaItem = {
    media_id: string
    storage_path: string
    mime_type: string | null
    file_size?: number | null
    width?: number | null
    height?: number | null
    alt_text?: string | null
    title?: string | null
    status: boolean
    created_at?: string
    uploaded_at?: string
    url?: string | null
    thumbnail_path?: string | null
}

export type MediaUsagePlace =
    | { type: 'content.cover'; content_id: string; title: string; slug: string }
    | { type: 'content.body'; content_id: string; title: string; slug: string }

type ListFilters = {
    type?: 'image' | 'document' | 'all'
    used?: '1' | '0'
    search?: string
    limit?: number
    offset?: number
}

type BulkUploadProgress = {
    total: number
    completed: number
    failed: number
    current?: string
}

type MediaState = {
    items: MediaItem[]
    total: number
    limit: number
    offset: number
    loading: boolean
    error: string | null

    selected: MediaItem | null
    selectedUsage: MediaUsagePlace[]
    detailsLoading: boolean

    bulkUploading: boolean
    bulkProgress: BulkUploadProgress | null

    fetchMedia: (filters?: ListFilters) => Promise<void>
    fetchMediaDetails: (id: string) => Promise<void>

    upload: (
        file: File,
        meta?: { title?: string; alt_text?: string }
    ) => Promise<MediaItem>

    uploadBulk: (files: File[]) => Promise<{
        success: number
        failed: number
        results: any[]
        errors: any[]
    }>

    update: (
        id: string,
        data: { title?: string; alt_text?: string; status?: boolean }
    ) => Promise<MediaItem>

    deleteOne: (
        id: string
    ) => Promise<
        | { ok: true }
        | { ok: false; code: 'MEDIA_IN_USE'; places: MediaUsagePlace[] }
    >

    clearError: () => void
    clearSelected: () => void
}

export const useMedia = create<MediaState>((set, get) => ({
    items: [],
    total: 0,
    limit: 20,
    offset: 0,
    loading: false,
    error: null,

    selected: null,
    selectedUsage: [],
    detailsLoading: false,

    bulkUploading: false,
    bulkProgress: null,

    clearError: () => set({ error: null }),
    clearSelected: () => set({ selected: null, selectedUsage: [] }),

    fetchMedia: async (filters) => {
        set({ loading: true, error: null })
        try {
            const limit = filters?.limit ?? get().limit
            const offset = filters?.offset ?? get().offset

            const res = await api.get('/media', {
                params: { ...filters, limit, offset },
            })

            set({
                items: res.data.items ?? [],
                total: res.data.total ?? 0,
                limit: res.data.limit ?? limit,
                offset: res.data.offset ?? offset,
                loading: false,
            })
        } catch (e: any) {
            const msg =
                e?.response?.data?.error ?? 'Nie udało się pobrać mediów'
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

    fetchMediaDetails: async (id) => {
        set({ detailsLoading: true, error: null })
        try {
            const res = await api.get(`/media/${id}`)
            set({
                selected: res.data.media ?? null,
                selectedUsage: res.data.usage ?? [],
                detailsLoading: false,
            })
        } catch (e: any) {
            const msg =
                e?.response?.data?.error ?? 'Nie udało się pobrać szczegółów'
            set({ error: msg, detailsLoading: false })
            throw e
        }
    },

    upload: async (file, meta) => {
        set({ loading: true, error: null })
        try {
            const fd = new FormData()
            fd.append('file', file)
            if (meta?.title) fd.append('title', meta.title)
            if (meta?.alt_text) fd.append('alt_text', meta.alt_text)

            const res = await api.post('/media', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })

            const created: MediaItem = res.data.media
            set({ items: [created, ...get().items], loading: false })

            showAlert({
                variant: 'success',
                title: 'Wgrano plik',
                message: 'Zasób został dodany do biblioteki mediów.',
                duration: 3000,
            })

            return created
        } catch (e: any) {
            const msg = e?.response?.data?.error ?? 'Nie udało się wgrać pliku'
            set({ error: msg, loading: false })
            showAlert({
                variant: 'error',
                title: 'Błąd uploadu',
                message: msg,
                duration: 5000,
            })
            throw e
        }
    },

    uploadBulk: async (files) => {
        set({
            bulkUploading: true,
            error: null,
            bulkProgress: {
                total: files.length,
                completed: 0,
                failed: 0,
            },
        })

        try {
            const fd = new FormData()
            files.forEach((file) => {
                fd.append('files', file)
            })

            const res = await api.post('/media/bulk', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        )
                        console.log(`Upload progress: ${percentCompleted}%`)
                    }
                },
            })

            const { success, failed, results, errors } = res.data

            const newMedia = results
                .filter((r: any) => r.success)
                .map((r: any) => r.media)

            set({
                items: [...newMedia, ...get().items],
                bulkUploading: false,
                bulkProgress: null,
            })

            if (failed > 0) {
                showAlert({
                    variant: 'warning',
                    title: 'Częściowy sukces',
                    message: `Wgrano ${success} plików. ${failed} nie udało się.`,
                    duration: 5000,
                })
            } else {
                showAlert({
                    variant: 'success',
                    title: 'Wgrano pliki',
                    message: `Pomyślnie wgrano ${success} plików.`,
                    duration: 3000,
                })
            }

            return { success, failed, results, errors }
        } catch (e: any) {
            const msg = e?.response?.data?.error ?? 'Nie udało się wgrać plików'
            set({ error: msg, bulkUploading: false, bulkProgress: null })
            showAlert({
                variant: 'error',
                title: 'Błąd uploadu',
                message: msg,
                duration: 5000,
            })
            throw e
        }
    },

    update: async (id, data) => {
        set({ loading: true, error: null })
        try {
            const res = await api.put(`/media/${id}`, data)
            const updated: MediaItem = res.data.media

            set({
                items: get().items.map((m) =>
                    m.media_id === id ? updated : m
                ),
                selected:
                    get().selected?.media_id === id ? updated : get().selected,
                loading: false,
            })

            showAlert({
                variant: 'success',
                title: 'Zapisano',
                message: 'Metadane zasobu zostały zaktualizowane.',
                duration: 2500,
            })

            return updated
        } catch (e: any) {
            const msg =
                e?.response?.data?.error ?? 'Nie udało się zaktualizować zasobu'
            set({ error: msg, loading: false })
            throw e
        }
    },

    deleteOne: async (id) => {
        set({ loading: true, error: null })
        try {
            await api.delete(`/media/${id}`)
            set({
                items: get().items.filter((m) => m.media_id !== id),
                loading: false,
            })
            showAlert({
                variant: 'success',
                title: 'Usunięto',
                message: 'Zasób został usunięty.',
                duration: 2500,
            })
            return { ok: true } as const
        } catch (e: any) {
            const status = e?.response?.status
            const code = e?.response?.data?.code
            if (status === 409 && code === 'MEDIA_IN_USE') {
                return {
                    ok: false,
                    code: 'MEDIA_IN_USE' as const,
                    places: e?.response?.data?.places ?? [],
                }
            }
            const msg =
                e?.response?.data?.error ?? 'Nie udało się usunąć zasobu'
            set({ error: msg, loading: false })
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
