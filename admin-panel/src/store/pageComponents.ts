import { create } from 'zustand'
import { api } from '../api/axios'

export type ComponentType =
    | 'hero'
    | 'services'
    | 'testimonial'
    | 'team'
    | 'pricing'
    | 'hours'
    | 'contact_form'
    | 'map'

export interface PageComponent {
    component_id: string
    content_id: string
    component_type: ComponentType
    data: any
    order_index: number
    display_order: number
    status: boolean
    created_at: string
    updated_at: string
}

export interface HeroComponentData {
    slides: Array<{
        title?: string
        subtitle?: string
        description?: string
        buttonText?: string
        buttonLink?: string
        media_id?: string
        overlayOpacity?: number
    }>
    autoplay?: boolean
    interval?: number
}

export interface ServicesComponentData {
    title?: string
    subtitle?: string
    items: Array<{
        icon?: string
        name: string
        description?: string
        price?: string
        media_id?: string
        link?: string
    }>
    layout?: 'grid' | 'list' | 'carousel'
    columns?: number
}

export interface TestimonialComponentData {
    title?: string
    items: Array<{
        quote: string
        author: string
        role?: string
        company?: string
        rating?: number
        media_id?: string
    }>
    layout?: 'slider' | 'grid' | 'masonry'
}

export interface TeamComponentData {
    title?: string
    subtitle?: string
    members: Array<{
        name: string
        role: string
        bio?: string
        media_id?: string
        email?: string
        phone?: string
        social?: {
            linkedin?: string
            twitter?: string
            facebook?: string
            instagram?: string
        }
    }>
    layout?: 'grid' | 'list'
    columns?: number
}

export interface PricingComponentData {
    title?: string
    subtitle?: string
    services: Array<{
        name: string
        price: string
        description?: string
        media_id?: string
    }>
}

export interface HoursComponentData {
    title?: string
    hours: Array<{
        days: string
        time: string
        closed?: boolean
    }>
    specialNote?: string
}

export interface ContactFormComponentData {
    title?: string
    subtitle?: string
    fields: Array<{
        type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox'
        name: string
        label: string
        placeholder?: string
        required?: boolean
        options?: string[]
    }>
    submitText?: string
    successMessage?: string
    emailTo?: string
}

export interface MapComponentData {
    title?: string
    latitude: number
    longitude: number
    zoom?: number
    marker?: boolean
    markerTitle?: string
    height?: string
}

interface PageComponentsState {
    components: PageComponent[]
    loading: boolean
    error: string | null

    fetchComponents: (
        contentId: string,
        includeInactive?: boolean
    ) => Promise<void>
    createComponent: (
        contentId: string,
        data: {
            component_type: ComponentType
            data: any
            order_index?: number
            status?: boolean
        }
    ) => Promise<PageComponent>
    updateComponent: (
        componentId: string,
        updates: {
            data?: any
            order_index?: number
            status?: boolean
        }
    ) => Promise<PageComponent>
    deleteComponent: (componentId: string) => Promise<void>
    reorderComponents: (
        contentId: string,
        componentIds: string[]
    ) => Promise<void>
    duplicateComponent: (componentId: string) => Promise<PageComponent>
    toggleComponentStatus: (componentId: string) => Promise<void>
    clearComponents: () => void
}

export const usePageComponents = create<PageComponentsState>((set, get) => ({
    components: [],
    loading: false,
    error: null,

    fetchComponents: async (contentId: string, includeInactive = false) => {
        set({ loading: true, error: null })
        try {
            const params = includeInactive ? { include_inactive: 'true' } : {}
            const res = await api.get(
                `/components/contents/${contentId}/components`,
                { params }
            )
            set({ components: res.data, loading: false })
        } catch (error: any) {
            set({ error: error.message, loading: false })
            throw error
        }
    },

    createComponent: async (contentId, data) => {
        set({ loading: true, error: null })
        try {
            const res = await api.post(
                `/components/contents/${contentId}/components`,
                data
            )
            const newComponent = res.data

            set((state) => ({
                components: [...state.components, newComponent].sort(
                    (a, b) => a.order_index - b.order_index
                ),
                loading: false,
            }))

            return newComponent
        } catch (error: any) {
            set({ error: error.message, loading: false })
            throw error
        }
    },

    updateComponent: async (componentId, updates) => {
        set({ loading: true, error: null })
        try {
            const res = await api.put(`/components/${componentId}`, updates)
            const updatedComponent = res.data

            set((state) => ({
                components: state.components.map((c) =>
                    c.component_id === componentId ? updatedComponent : c
                ),
                loading: false,
            }))

            return updatedComponent
        } catch (error: any) {
            set({ error: error.message, loading: false })
            throw error
        }
    },

    deleteComponent: async (componentId) => {
        set({ loading: true, error: null })
        try {
            await api.delete(`/components/${componentId}`)

            set((state) => ({
                components: state.components.filter(
                    (c) => c.component_id !== componentId
                ),
                loading: false,
            }))
        } catch (error: any) {
            set({ error: error.message, loading: false })
            throw error
        }
    },

    reorderComponents: async (contentId, componentIds) => {
        set({ loading: true, error: null })
        try {
            const res = await api.post(
                `/components/${contentId}/components/reorder`,
                {
                    component_ids: componentIds,
                }
            )

            set({ components: res.data, loading: false })
        } catch (error: any) {
            set({ error: error.message, loading: false })
            throw error
        }
    },

    duplicateComponent: async (componentId) => {
        set({ loading: true, error: null })
        try {
            const res = await api.post(`/components/${componentId}/duplicate`)
            const duplicated = res.data

            set((state) => ({
                components: [...state.components, duplicated].sort(
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

    toggleComponentStatus: async (componentId) => {
        set({ loading: true, error: null })
        try {
            const res = await api.patch(`/components/${componentId}/toggle`)
            const toggled = res.data

            set((state) => ({
                components: state.components.map((c) =>
                    c.component_id === componentId ? toggled : c
                ),
                loading: false,
            }))
        } catch (error: any) {
            set({ error: error.message, loading: false })
            throw error
        }
    },

    clearComponents: () => {
        set({ components: [], loading: false, error: null })
    },
}))
