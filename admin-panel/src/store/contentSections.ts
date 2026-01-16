import { create } from 'zustand'
import { api } from '../api/axios'

export type SectionType =
    | 'text'
    | 'image'
    | 'gallery'
    | 'pdf'
    | 'video'
    | 'html'
    | 'embed'

export interface ContentSection {
    section_id: string
    content_id: string
    section_type: SectionType
    order_index: number
    display_order: number
    heading?: string
    subheading?: string
    body?: string
    media_ids: string[]
    settings: any
    status: boolean
    created_at: string
    updated_at: string
}

interface ContentSectionsState {
    sections: ContentSection[]
    loading: boolean
    error: string | null

    fetchSections: (contentId: string) => Promise<void>
    createSection: (
        contentId: string,
        data: {
            section_type: SectionType
            heading?: string
            subheading?: string
            body?: string
            media_ids?: string[]
            settings?: any
            status?: boolean
        }
    ) => Promise<ContentSection>
    updateSection: (
        contentId: string,
        sectionId: string,
        updates: {
            heading?: string
            subheading?: string
            body?: string
            media_ids?: string[]
            settings?: any
            status?: boolean
        }
    ) => Promise<ContentSection>
    deleteSection: (contentId: string, sectionId: string) => Promise<void>
    reorderSections: (contentId: string, sectionIds: string[]) => Promise<void>
    duplicateSection: (sectionId: string) => Promise<ContentSection>
    toggleSectionStatus: (sectionId: string) => Promise<void>
    clearSections: () => void
}

export const useContentSections = create<ContentSectionsState>((set, get) => ({
    sections: [],
    loading: false,
    error: null,

    fetchSections: async (contentId: string) => {
        set({ loading: true, error: null })
        try {
            const res = await api.get(`/contents/${contentId}/sections`)
            set({ sections: res.data.sections || [], loading: false })
        } catch (error: any) {
            set({ error: error.message, loading: false })
            throw error
        }
    },

    createSection: async (contentId, data) => {
        set({ loading: true, error: null })
        try {
            const res = await api.post(`/contents/${contentId}/sections`, data)

            const newSection = res.data.section || res.data

            set((state) => ({
                sections: [...state.sections, newSection].sort(
                    (a, b) => a.order_index - b.order_index
                ),
                loading: false,
            }))

            return newSection
        } catch (error: any) {
            set({ error: error.message, loading: false })
            throw error
        }
    },

    updateSection: async (contentId, sectionId, updates) => {
        set({ loading: true, error: null })
        try {
            const res = await api.put(
                `/contents/${contentId}/sections/${sectionId}`,
                updates
            )

            const updatedSection = res.data.section || res.data

            set((state) => ({
                sections: state.sections.map((s) =>
                    s.section_id === sectionId ? { ...s, ...updatedSection } : s
                ),
                loading: false,
            }))

            return updatedSection
        } catch (error: any) {
            set({ error: error.message, loading: false })
            throw error
        }
    },

    deleteSection: async (contentId, sectionId) => {
        set({ loading: true, error: null })
        try {
            await api.delete(`/contents/${contentId}/sections/${sectionId}`)

            set((state) => ({
                sections: state.sections.filter(
                    (s) => s.section_id !== sectionId
                ),
                loading: false,
            }))
        } catch (error: any) {
            set({ error: error.message, loading: false })
            throw error
        }
    },

    reorderSections: async (contentId, sectionIds) => {
        set({ loading: true, error: null })
        try {
            const res = await api.post(
                `/contents/${contentId}/sections/reorder`,
                {
                    section_ids: sectionIds,
                }
            )

            set({ sections: res.data, loading: false })
        } catch (error: any) {
            set({ error: error.message, loading: false })
            throw error
        }
    },

    duplicateSection: async (sectionId) => {
        set({ loading: true, error: null })
        try {
            const res = await api.post(`/sections/${sectionId}/duplicate`)
            const duplicated = res.data

            set((state) => ({
                sections: [...state.sections, duplicated].sort(
                    (a, b) => a.order_index - b.order_index
                ),
                loading: false,
            }))

            return duplicated
        } catch (error: any) {
            set({ error: error.message, loading: false })
            throw error
        }
    },

    toggleSectionStatus: async (sectionId) => {
        set({ loading: true, error: null })
        try {
            const res = await api.put(`/contents/sections/${sectionId}/toggle`)
            const toggled = res.data

            set((state) => ({
                sections: state.sections.map((s) =>
                    s.section_id === sectionId ? toggled : s
                ),
                loading: false,
            }))
        } catch (error: any) {
            set({ error: error.message, loading: false })
            throw error
        }
    },

    clearSections: () => {
        set({ sections: [], loading: false, error: null })
    },
}))
