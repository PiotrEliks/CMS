import { create } from 'zustand';
import { api } from '../api/axios';
import { useAlerts, type AlertPayload } from './alerts';

export type SectionType = 'text' | 'image' | 'gallery' | 'pdf' | 'video' | 'html' | 'embed';

export interface SectionSettings {
  alignment?: 'left' | 'center' | 'right';
  width?: 'full' | 'contained';
  background_color?: string;
  padding?: string;
  custom_css?: string;
  embed_code?: string;
  embed_url?: string;
  video_url?: string;
  video_provider?: 'youtube' | 'vimeo' | 'custom';
  autoplay?: boolean;
  layout?: 'grid' | 'carousel' | 'masonry';
  columns?: number;
}

export interface Media {
  media_id: string;
  filename: string;
  storage_path: string;
  mime_type: string;
  url?: string;
  thumbnail_path?: string;
  alt_text?: string;
  title?: string;
  width?: number;
  height?: number;
}

export interface ContentSection {
  section_id: string;
  content_id: string;
  section_type: SectionType;
  order_index: number;
  heading?: string | null;
  subheading?: string | null;
  body?: string | null;
  media_ids?: string[] | null;
  settings?: SectionSettings | null;
  status: boolean;
  media?: Media[];
  created_at: string;
  updated_at: string;
}

export interface CreateSectionPayload {
  section_type: SectionType;
  heading?: string;
  subheading?: string;
  body?: string;
  media_ids?: string[];
  settings?: SectionSettings;
  order_index?: number;
}

export interface UpdateSectionPayload {
  section_type?: SectionType;
  heading?: string;
  subheading?: string;
  body?: string;
  media_ids?: string[];
  settings?: SectionSettings;
  status?: boolean;
  order_index?: number;
}

export interface ReorderItem {
  section_id: string;
  order_index: number;
}

type ContentSectionsState = {
  sections: ContentSection[];
  currentContentId: string | null;
  loading: boolean;
  error: string | null;

  fetchSections: (contentId: string) => Promise<void>;
  createSection: (contentId: string, data: CreateSectionPayload) => Promise<ContentSection>;
  updateSection: (
    contentId: string,
    sectionId: string,
    data: UpdateSectionPayload
  ) => Promise<ContentSection>;
  deleteSection: (contentId: string, sectionId: string) => Promise<void>;
  reorderSections: (contentId: string, items: ReorderItem[]) => Promise<void>;
  duplicateSection: (contentId: string, sectionId: string) => Promise<ContentSection>;

  clearSections: () => void;
  clearError: () => void;
};

const showAlert = (payload: AlertPayload) => {
  useAlerts.getState().showAlert(payload);
};

export const useContentSections = create<ContentSectionsState>((set, get) => ({
  sections: [],
  currentContentId: null,
  loading: false,
  error: null,

  clearSections: () => set({ sections: [], currentContentId: null }),
  clearError: () => set({ error: null }),

  fetchSections: async (contentId: string) => {
    set({ loading: true, error: null, currentContentId: contentId });
    try {
      const res = await api.get(`/contents/${contentId}/sections`);
      set({ sections: res.data.sections ?? [], loading: false });
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? 'Nie udało się pobrać sekcji';
      set({ error: msg, loading: false });
      showAlert({
        variant: 'error',
        title: 'Błąd',
        message: msg,
        duration: 5000,
      });
      throw e;
    }
  },

  createSection: async (contentId: string, data: CreateSectionPayload) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post(`/contents/${contentId}/sections`, data);
      const created: ContentSection = res.data.section;

      const current = get().sections;
      set({ sections: [...current, created], loading: false });

      showAlert({
        variant: 'success',
        title: 'Dodano sekcję',
        message: 'Sekcja została pomyślnie dodana.',
        duration: 3000,
      });

      return created;
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? 'Nie udało się dodać sekcji';
      set({ error: msg, loading: false });
      showAlert({
        variant: 'error',
        title: 'Błąd',
        message: msg,
        duration: 5000,
      });
      throw e;
    }
  },

  updateSection: async (contentId: string, sectionId: string, data: UpdateSectionPayload) => {
    set({ loading: true, error: null });
    try {
      const res = await api.put(`/contents/${contentId}/sections/${sectionId}`, data);
      const updated: ContentSection = res.data.section;

      const current = get().sections;
      set({
        sections: current.map((s) => (s.section_id === sectionId ? updated : s)),
        loading: false,
      });

      showAlert({
        variant: 'success',
        title: 'Zaktualizowano sekcję',
        message: 'Sekcja została pomyślnie zaktualizowana.',
        duration: 3000,
      });

      return updated;
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? 'Nie udało się zaktualizować sekcji';
      set({ error: msg, loading: false });
      showAlert({
        variant: 'error',
        title: 'Błąd',
        message: msg,
        duration: 5000,
      });
      throw e;
    }
  },

  deleteSection: async (contentId: string, sectionId: string) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/contents/${contentId}/sections/${sectionId}`);

      const current = get().sections;
      set({
        sections: current.filter((s) => s.section_id !== sectionId),
        loading: false,
      });

      showAlert({
        variant: 'success',
        title: 'Usunięto sekcję',
        message: 'Sekcja została pomyślnie usunięta.',
        duration: 3000,
      });
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? 'Nie udało się usunąć sekcji';
      set({ error: msg, loading: false });
      showAlert({
        variant: 'error',
        title: 'Błąd',
        message: msg,
        duration: 5000,
      });
      throw e;
    }
  },

  reorderSections: async (contentId: string, items: ReorderItem[]) => {
    const previousSections = get().sections;

    const reordered = [...previousSections].sort((a, b) => {
      const aIndex = items.find((i) => i.section_id === a.section_id)?.order_index ?? a.order_index;
      const bIndex = items.find((i) => i.section_id === b.section_id)?.order_index ?? b.order_index;
      return aIndex - bIndex;
    });
    set({ sections: reordered });

    try {
      const res = await api.post(`/contents/${contentId}/sections/reorder`, { items });
      set({ sections: res.data.sections ?? reordered, loading: false });
    } catch (e: any) {
      set({ sections: previousSections });

      const msg = e?.response?.data?.error ?? 'Nie udało się zmienić kolejności';
      showAlert({
        variant: 'error',
        title: 'Błąd',
        message: msg,
        duration: 5000,
      });
      throw e;
    }
  },

  duplicateSection: async (contentId: string, sectionId: string) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post(`/contents/${contentId}/sections/${sectionId}/duplicate`);
      const duplicated: ContentSection = res.data.section;

      const current = get().sections;
      set({ sections: [...current, duplicated], loading: false });

      showAlert({
        variant: 'success',
        title: 'Zduplikowano sekcję',
        message: 'Sekcja została pomyślnie zduplikowana.',
        duration: 3000,
      });

      return duplicated;
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? 'Nie udało się zduplikować sekcji';
      set({ error: msg, loading: false });
      showAlert({
        variant: 'error',
        title: 'Błąd',
        message: msg,
        duration: 5000,
      });
      throw e;
    }
  },
}));
