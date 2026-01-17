import { useEffect, useState, useCallback } from 'react'
import { api, BACKEND_URL } from '../../api/axios'
import type { PageComponent } from '../../types'
import HeroRenderer from './HeroRenderer'
import ServicesRenderer from './ServicesRenderer'
import TestimonialsRenderer from './TestimonialsRenderer'
import TeamRenderer from './TeamRenderer'
import PricingRenderer from './PricingRenderer'
import HoursRenderer from './HoursRenderer'
import ContactFormRenderer from './ContactFormRenderer'
import MapRenderer from './MapRenderer'

interface MediaInfo {
  media_id: string
  storage_path: string
  thumbnail_path?: string
  alt_text?: string
  title?: string
}

interface ComponentRendererProps {
  component: PageComponent
  getMediaUrl: (mediaId: string | undefined) => string
}

export function ComponentRenderer({ component, getMediaUrl }: ComponentRendererProps) {
  if (!component.status) return null

  switch (component.component_type) {
    case 'hero':
      return <HeroRenderer data={component.data as any} getMediaUrl={getMediaUrl} />
    case 'services':
      return <ServicesRenderer data={component.data as any} getMediaUrl={getMediaUrl} />
    case 'testimonial':
      return <TestimonialsRenderer data={component.data as any} getMediaUrl={getMediaUrl} />
    case 'team':
      return <TeamRenderer data={component.data as any} getMediaUrl={getMediaUrl} />
    case 'pricing':
      return <PricingRenderer data={component.data as any} getMediaUrl={getMediaUrl} />
    case 'hours':
      return <HoursRenderer data={component.data as any} />
    case 'contact_form':
      return <ContactFormRenderer data={component.data as any} />
    case 'map':
      return <MapRenderer data={component.data as any} />
    default:
      console.warn(`Unknown component type: ${component.component_type}`)
      return null
  }
}

// Extract all media_ids from components
function extractMediaIds(components: PageComponent[]): string[] {
  const ids: string[] = []

  components.forEach((c) => {
    const data = c.data as any
    if (!data) return

    // Hero slides
    if (data.slides) {
      data.slides.forEach((slide: any) => {
        if (slide.media_id) ids.push(slide.media_id)
      })
    }

    // Services/Team items
    if (data.items) {
      data.items.forEach((item: any) => {
        if (item.media_id) ids.push(item.media_id)
      })
    }

    // Team members
    if (data.members) {
      data.members.forEach((member: any) => {
        if (member.media_id) ids.push(member.media_id)
      })
    }

    // Services in pricing
    if (data.services) {
      data.services.forEach((service: any) => {
        if (service.media_id) ids.push(service.media_id)
      })
    }

    // Single media_id
    if (data.media_id) ids.push(data.media_id)
  })

  return [...new Set(ids.filter(Boolean))]
}

interface PageComponentsListProps {
  components: PageComponent[]
}

export function PageComponentsList({ components }: PageComponentsListProps) {
  const [mediaCache, setMediaCache] = useState<Map<string, MediaInfo>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMedia = async () => {
      const mediaIds = extractMediaIds(components)
      if (mediaIds.length === 0) {
        setLoading(false)
        return
      }

      try {
        const responses = await Promise.all(
          mediaIds.map((id) =>
            api
              .get(`/media/${id}`)
              .then((res) => res.data)
              .catch(() => null)
          )
        )

        const cache = new Map<string, MediaInfo>()
        responses.forEach((data) => {
          if (data) {
            const media = data.media || data
            if (media.media_id) {
              cache.set(media.media_id, media)
            }
          }
        })
        setMediaCache(cache)
      } catch (err) {
        console.error('Failed to fetch media:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMedia()
  }, [components])

  const getMediaUrl = useCallback(
    (mediaId: string | undefined): string => {
      if (!mediaId) return ''
      const media = mediaCache.get(mediaId)
      if (!media) return ''
      return `${BACKEND_URL}${media.storage_path}`
    },
    [mediaCache]
  )

  if (!components || components.length === 0) {
    return null
  }

  const sortedComponents = [...components]
    .filter((c) => c.status)
    .sort((a, b) => a.order_index - b.order_index)

  // Show loading placeholder only for first component if loading
  if (loading && sortedComponents.length > 0) {
    return (
      <div className="site-blocks-cover" style={{ minHeight: '500px', background: '#f8f9fa' }}>
        <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: '500px' }}>
          <p className="text-muted">Ładowanie...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {sortedComponents.map((component) => (
        <ComponentRenderer
          key={component.component_id}
          component={component}
          getMediaUrl={getMediaUrl}
        />
      ))}
    </>
  )
}

export {
  HeroRenderer,
  ServicesRenderer,
  TestimonialsRenderer,
  TeamRenderer,
  PricingRenderer,
  HoursRenderer,
  ContactFormRenderer,
  MapRenderer,
}
