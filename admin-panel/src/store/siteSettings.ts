import { create } from 'zustand'
import { api } from '../api/axios'
import { useAlerts } from './alerts'

const showAlert = (payload: any) => useAlerts.getState().showAlert(payload)

export interface SocialMedia {
  platform:
    | 'facebook'
    | 'twitter'
    | 'instagram'
    | 'linkedin'
    | 'youtube'
    | 'tiktok'
    | 'github'
  url: string
  icon?: string
}

export interface SiteSettings {
  general: {
    site_name?: string
    site_tagline?: string
    site_description?: string
  }
  header: {
    header_logo_media_id?: string
    header_menu_code?: string
    header_background_color?: string
    header_text_color?: string
    header_sticky?: boolean
  }
  footer: {
    footer_logo_media_id?: string
    footer_menu_code?: string
    footer_background_color?: string
    footer_text_color?: string
    footer_copyright_text?: string
    footer_show_social?: boolean
  }
  social_media: {
    social_media?: SocialMedia[]
  }
  contact: {
    contact_email?: string
    contact_phone?: string
    contact_address?: string
  }
  seo: {
    default_meta_title?: string
    default_meta_description?: string
    default_og_image_media_id?: string
  }
  analytics: {
    google_analytics_id?: string
    facebook_pixel_id?: string
  }
  advanced: {
    favicon_media_id?: string
    custom_css?: string
    custom_js?: string
  }
}

type SettingsState = {
  settings: SiteSettings | null
  loading: boolean
  saving: boolean
  error: string | null

  fetchSettings: () => Promise<void>
  updateSettings: (key: keyof SiteSettings, value: any) => Promise<void>
  clearError: () => void
}

export const useSiteSettings = create<SettingsState>((set, get) => ({
  settings: null,
  loading: false,
  saving: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchSettings: async () => {
    set({ loading: true, error: null })
    try {
      const res = await api.get('/settings')
      set({ settings: res.data, loading: false })
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? 'Nie udało się pobrać ustawień'
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

  updateSettings: async (key, value) => {
    set({ saving: true, error: null })
    try {
      await api.put(`/settings/${key}`, value)

      set((state) => ({
        settings: state.settings
          ? {
              ...state.settings,
              [key]: { ...state.settings[key], ...value },
            }
          : null,
        saving: false,
      }))

      showAlert({
        variant: 'success',
        title: 'Zapisano',
        message: 'Ustawienia zostały zaktualizowane',
        duration: 3000,
      })
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? 'Nie udało się zapisać ustawień'
      set({ error: msg, saving: false })
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
