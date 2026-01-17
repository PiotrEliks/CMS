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
  data: ComponentData
  order_index: number
  display_order: number
  status: boolean
  created_at: string
  updated_at: string
}

export type ComponentData =
  | HeroComponentData
  | ServicesComponentData
  | TestimonialComponentData
  | TeamComponentData
  | PricingComponentData
  | HoursComponentData
  | ContactFormComponentData
  | MapComponentData

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
