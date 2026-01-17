export type SectionType =
  | 'text'
  | 'image'
  | 'gallery'
  | 'pdf'
  | 'video'
  | 'html'
  | 'embed'

export interface SectionSettings {
  alignment?: 'left' | 'center' | 'right'
  width?: 'full' | 'contained'
  background_color?: string
  padding?: string
  custom_css?: string
  embed_code?: string
  embed_url?: string
  video_url?: string
  video_provider?: 'youtube' | 'vimeo' | 'custom'
  autoplay?: boolean
  layout?: 'grid' | 'carousel' | 'masonry'
  columns?: number
  link?: string
}

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
  settings: SectionSettings
  status: boolean
  created_at: string
  updated_at: string
}

export interface SectionMedia {
  media_id: string
  storage_path: string
  alt_text?: string
  title?: string
  thumbnail_path?: string
  mime_type?: string
}
