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
}

export interface Category {
  category_id: string;
  name: string;
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

export interface SiteSettings {
  SITE_HEADER_NAME?: string;
  SITE_DESCRIPTION?: string;
  SITE_EMAIL?: string;
  SITE_PHONE?: string;
  SITE_ADDRESS?: string;
  SITE_FACEBOOK?: string;
  SITE_INSTAGRAM?: string;
  SITE_TWITTER?: string;
}
