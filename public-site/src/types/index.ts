import type { ContentSection } from './sections'
import type { PageComponent } from './components'

export * from './sections'
export * from './components'

export interface Content {
  content_id: string;
  title: string;
  body: string;
  slug: string;
  status: 'draft' | 'published';
  meta_description?: string;
  meta_keywords?: string;
  cover_media_id?: string;
  cover_media?: Media;
  published_at?: string;
  created_at: string;
  updated_at: string;
  categories?: Category[];
  sections?: ContentSection[];
  components?: PageComponent[];
}

export interface Category {
  category_id: string;
  name?: string;
  display_name: string;
  slug: string;
  description?: string;
}

export interface Media {
  media_id: string;
  filename: string;
  url: string;
  mime_type: string;
  size: number;
}

export interface Menu {
  menu_id: string;
  name: string;
  slug: string;
  items?: MenuItem[];
}

export interface MenuItem {
  menu_item_id: string;
  menu_id: string;
  parent_id?: string;
  content_id?: string;
  label: string;
  url?: string;
  order: number;
  children?: MenuItem[];
  content?: Content;
}

export interface SocialMedia {
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok' | 'github';
  url: string;
  icon?: string;
}

export interface SiteSettings {
  general: {
    site_name?: string;
    site_tagline?: string;
    site_description?: string;
  };
  header: {
    header_logo_media_id?: string;
    header_logo_url?: string;
    header_menu_id?: string;
    header_background_type?: string;
    header_background_color?: string;
    header_background_media_id?: string;
    header_show_social?: boolean;
  };
  footer: {
    footer_logo_media_id?: string;
    footer_menu_id?: string;
    footer_description?: string;
    footer_background_color?: string;
    footer_copyright_text?: string;
    footer_show_social?: boolean;
  };
  social_media: {
    social_media?: SocialMedia[];
  };
  contact: {
    contact_email?: string;
    contact_phone?: string;
    contact_address?: string;
  };
}
