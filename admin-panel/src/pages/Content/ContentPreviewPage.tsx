import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, EyeIcon, EyeOffIcon } from 'lucide-react'
import PageMeta from '../../components/common/PageMeta'
import Button from '../../ui/button/Button'
import { api } from '../../api/axios'
import PageBreadcrumb from '../../components/common/PageBreadCrumb'
import MapComponent from '../../components/ui/content/MapComponent'

interface Content {
  content_id: string
  title: string
  slug: string
  lead?: string
  body?: string
  status: string
  cover_media_id?: string
  published_at: string | null
  meta_title?: string
  meta_description?: string
}

interface ContentSection {
  section_id: string
  section_type: string
  heading?: string
  subheading?: string
  body?: string
  status: boolean
  order_index: number
  display_order?: number
  media_ids: string[]
  settings: any
}

interface PageComponent {
  component_id: string
  component_type: string
  data: any
  status: boolean
  order_index: number
  display_order?: number
}

type DisplayItem = {
  id: string
  type: 'section' | 'component'
  display_order: number
  status: boolean
  data: ContentSection | PageComponent
}

interface Media {
  media_id: string
  title: string
  storage_path: string
  thumbnail_path?: string
  mime_type: string
}

export default function ContentPreviewPage() {
  const { id } = useParams<{ id: string }>()
  const [content, setContent] = useState<Content | null>(null)
  const [displayItems, setDisplayItems] = useState<DisplayItem[]>([])
  const [mediaCache, setMediaCache] = useState<Map<string, Media>>(new Map())
  const [loading, setLoading] = useState(true)
  const [showHidden, setShowHidden] = useState(false)

  useEffect(() => {
    if (id) {
      fetchContent()
      fetchAllContent()
    }
  }, [id])

  useEffect(() => {
    if (content?.cover_media_id && !mediaCache.has(content.cover_media_id)) {
      fetchMedia([content.cover_media_id])
    }
  }, [content?.cover_media_id])

  const fetchContent = async () => {
    try {
      const res = await api.get(`contents/${id}`)
      setContent(res.data)
    } catch (error) {
      console.error('Failed to fetch content:', error)
    }
  }

  const fetchAllContent = async () => {
    setLoading(true)
    try {
      const [sectionsRes, componentsRes] = await Promise.all([
        api.get(`/contents/${id}/sections`),
        api.get(`/components/contents/${id}/components`, {
          params: { include_inactive: 'true' },
        }),
      ])

      const sections = sectionsRes.data?.sections || []
      const components = componentsRes.data || []

      const items: DisplayItem[] = [
        ...sections.map((s: ContentSection) => ({
          id: `section-${s.section_id}`,
          type: 'section' as const,
          display_order: s.display_order ?? s.order_index * 2,
          status: s.status,
          data: s,
        })),
        ...components.map((c: PageComponent) => ({
          id: `component-${c.component_id}`,
          type: 'component' as const,
          display_order: c.display_order ?? c.order_index * 2 + 1,
          status: c.status,
          data: c,
        })),
      ]

      items.sort((a, b) => a.display_order - b.display_order)
      setDisplayItems(items)

      const allMediaIds = sections.flatMap(
        (s: ContentSection) => s.media_ids || []
      )
      const uniqueMediaIds = [
        ...new Set(allMediaIds.filter((id: string) => !!id)),
      ]

      if (uniqueMediaIds.length > 0) {
        await fetchMedia(uniqueMediaIds)
      }
    } catch (error) {
      console.error('Failed to fetch content:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMedia = async (mediaIds: string[]) => {
    const idsToFetch = mediaIds.filter((id) => !mediaCache.has(id))

    if (idsToFetch.length === 0) return

    const promises = idsToFetch.map((id) =>
      api.get(`/media/${id}`).catch((err) => {
        console.error(`Błąd pobierania medium ${id}:`, err)
        return null
      })
    )

    const responses = await Promise.all(promises)
    const newCache = new Map(mediaCache)

    responses.forEach((res) => {
      if (res?.data) {
        const mediaData = res.data.media || res.data
        newCache.set(mediaData.media_id, mediaData)
      }
    })

    setMediaCache(newCache)
  }

  const getMediaUrl = (mediaId: string): string => {
    const media = mediaCache.get(mediaId)
    if (!media) return ''
    return `${import.meta.env.VITE_API_UPLOADS}${media.storage_path}`
  }

  const getThumbnailUrl = (mediaId: string): string => {
    const media = mediaCache.get(mediaId)
    if (!media) return ''
    const path = media.thumbnail_path || media.storage_path
    return `${import.meta.env.VITE_API_UPLOADS}${path}`
  }

  const visibleItems = showHidden
    ? displayItems
    : displayItems.filter((item) => item.status)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Nie znaleziono treści</p>
        <Link to="/contents">
          <Button className="mt-4">Powrót do listy</Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <PageMeta
        title={`Podgląd: ${content.title}`}
        description="To jest strona podglądu treści w panelu administracyjnym"
      />
      <PageBreadcrumb
        pageTitle="Podgląd treści"
        items={[{ label: `${content.title}`, path: `/contents/${id}/edit` }]}
      />

      <div className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to={`/contents/${id}/edit`}>
              <Button variant="outline" size="sm" startIcon={<ArrowLeft />}>
                Powrót
              </Button>
            </Link>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {visibleItems.length} / {displayItems.length} elementów
                widocznych
              </span>
              <Button
                size="sm"
                variant={showHidden ? 'primary' : 'outline'}
                onClick={() => setShowHidden(!showHidden)}
                startIcon={showHidden ? <EyeIcon /> : <EyeOffIcon />}
              >
                {showHidden ? 'Ukryj nieaktywne' : 'Pokaż wszystkie'}
              </Button>
              <Link to={`/contents/${id}/edit`}>
                <Button size="sm" variant="primary">
                  Edytuj
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {content.cover_media_id ? (
        <div
          className="relative w-full h-[500px] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${import.meta.env.VITE_API_UPLOADS}${mediaCache.get(content.cover_media_id)?.storage_path || ''})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />

          <div className="relative h-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-2xl">
              {content.title}
            </h1>
            {content.lead && (
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl leading-relaxed drop-shadow-lg">
                {content.lead}
              </p>
            )}
            <div className="flex items-center gap-4 mt-8">
              <span
                className={`px-4 py-2 rounded-full font-medium ${
                  content.status === 'P'
                    ? 'bg-green-500/90 text-white backdrop-blur-sm'
                    : 'bg-gray-500/90 text-white backdrop-blur-sm'
                }`}
              >
                {content.status === 'P' ? 'Opublikowane' : 'Szkic'}
              </span>
              {content.published_at && (
                <span className="text-white/80 text-sm backdrop-blur-sm bg-black/30 px-4 py-2 rounded-full">
                  Opublikowano:{' '}
                  {new Date(content.published_at).toLocaleDateString('pl-PL')}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <header className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {content.title}
            </h1>
            {content.lead && (
              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                {content.lead}
              </p>
            )}
            <div className="flex items-center gap-4 mt-6 text-sm text-gray-500 dark:text-gray-400">
              <span
                className={`px-3 py-1 rounded-full ${
                  content.status === 'P'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {content.status === 'P' ? 'Opublikowane' : 'Szkic'}
              </span>
              {content.published_at && (
                <span>
                  Opublikowano:{' '}
                  {new Date(content.published_at).toLocaleDateString('pl-PL')}
                </span>
              )}
            </div>
          </header>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {content.body && (
          <div
            className="prose dark:prose-invert max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: content.body }}
          />
        )}

        <div className="space-y-12">
          {visibleItems.map((item) => (
            <ItemRenderer
              key={item.id}
              item={item}
              getMediaUrl={getMediaUrl}
              getThumbnailUrl={getThumbnailUrl}
              mediaCache={mediaCache}
              showHidden={showHidden}
            />
          ))}
        </div>

        {displayItems.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">
              Brak treści. Dodaj sekcje lub komponenty w edytorze.
            </p>
          </div>
        )}
      </div>
    </>
  )
}

interface ItemRendererProps {
  item: DisplayItem
  getMediaUrl: (id: string) => string
  getThumbnailUrl: (id: string) => string
  mediaCache: Map<string, Media>
  showHidden: boolean
}

function ItemRenderer({
  item,
  getMediaUrl,
  getThumbnailUrl,
  mediaCache,
  showHidden,
}: ItemRendererProps) {
  if (item.type === 'section') {
    return (
      <SectionRenderer
        section={item.data as ContentSection}
        getMediaUrl={getMediaUrl}
        getThumbnailUrl={getThumbnailUrl}
        mediaCache={mediaCache}
        showHidden={showHidden}
        isHidden={!item.status}
      />
    )
  } else {
    return (
      <ComponentRenderer
        component={item.data as PageComponent}
        showHidden={showHidden}
        isHidden={!item.status}
      />
    )
  }
}

interface SectionRendererProps {
  section: ContentSection
  getMediaUrl: (id: string) => string
  getThumbnailUrl: (id: string) => string
  mediaCache: Map<string, Media>
  showHidden: boolean
  isHidden: boolean
}

function SectionRenderer({
  section,
  getMediaUrl,
  getThumbnailUrl,
  mediaCache,
  showHidden,
  isHidden,
}: SectionRendererProps) {
  return (
    <section
      className={`relative ${
        isHidden && showHidden
          ? 'opacity-50 border-2 border-dashed border-yellow-400 dark:border-yellow-600 rounded-lg p-4'
          : ''
      }`}
    >
      {isHidden && showHidden && (
        <div className="absolute -top-3 left-4 bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded text-xs font-medium text-yellow-800 dark:text-yellow-200">
          Ukryta sekcja
        </div>
      )}

      {section.heading && (
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          {section.heading}
        </h2>
      )}

      {section.subheading && (
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
          {section.subheading}
        </p>
      )}

      {section.section_type === 'text' && section.body && (
        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: section.body }}
        />
      )}

      {section.section_type === 'image' && section.media_ids[0] && (
        <div className="my-6">
          <img
            src={getMediaUrl(section.media_ids[0])}
            alt={section.heading || 'Image'}
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      )}

      {section.section_type === 'gallery' && section.media_ids.length > 0 && (
        <div
          className={`grid gap-4 my-6 ${
            section.settings?.layout === 'masonry'
              ? 'columns-2 md:columns-3'
              : `grid-cols-2 md:grid-cols-${section.settings?.columns || 3}`
          }`}
        >
          {section.media_ids.map((mediaId) => (
            <div key={mediaId} className="overflow-hidden rounded-lg">
              <img
                src={getMediaUrl(mediaId)}
                alt=""
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      )}

      {section.section_type === 'pdf' && section.media_ids[0] && (
        <div className="my-6 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={getThumbnailUrl(section.media_ids[0])}
              alt="PDF thumbnail"
              className="w-24 h-24 object-cover rounded"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                {mediaCache.get(section.media_ids[0])?.title || 'Dokument PDF'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Plik PDF
              </p>
            </div>
            <a
              href={getMediaUrl(section.media_ids[0])}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-primary dark:text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Otwórz PDF
            </a>
          </div>
        </div>
      )}

      {section.section_type === 'video' && section.settings?.video_url && (
        <div className="my-6 aspect-video">
          {section.settings.video_provider === 'youtube' && (
            <iframe
              src={`https://www.youtube.com/embed/${extractYouTubeId(
                section.settings.video_url
              )}${section.settings.autoplay ? '?autoplay=1' : ''}`}
              className="w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
          {section.settings.video_provider === 'vimeo' && (
            <iframe
              src={`https://player.vimeo.com/video/${extractVimeoId(
                section.settings.video_url
              )}${section.settings.autoplay ? '?autoplay=1' : ''}`}
              className="w-full h-full rounded-lg"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          )}
          {section.settings.video_provider === 'custom' && (
            <video
              src={section.settings.video_url}
              controls
              autoPlay={section.settings.autoplay}
              className="w-full h-full rounded-lg"
            />
          )}
        </div>
      )}

      {section.section_type === 'html' && section.body && (
        <div
          className="my-6"
          dangerouslySetInnerHTML={{ __html: section.body }}
        />
      )}

      {section.section_type === 'embed' && section.settings?.embed_code && (
        <div
          className="my-6"
          dangerouslySetInnerHTML={{
            __html: section.settings.embed_code,
          }}
        />
      )}
    </section>
  )
}

interface ComponentRendererProps {
  component: PageComponent
  showHidden: boolean
  isHidden: boolean
}

function ComponentRenderer({
  component,
  showHidden,
  isHidden,
}: ComponentRendererProps) {
  return (
    <section
      className={`relative ${
        isHidden && showHidden
          ? 'opacity-50 border-2 border-dashed border-blue-400 dark:border-blue-600 rounded-lg p-4'
          : ''
      }`}
    >
      {isHidden && showHidden && (
        <div className="absolute -top-3 left-4 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-xs font-medium text-blue-800 dark:text-blue-200">
          Ukryty komponent
        </div>
      )}

      {component.component_type === 'hero' && (
        <HeroComponent data={component.data} />
      )}
      {component.component_type === 'services' && (
        <ServicesComponent data={component.data} />
      )}
      {component.component_type === 'pricing' && (
        <PricingComponent data={component.data} />
      )}
      {component.component_type === 'team' && (
        <TeamComponent data={component.data} />
      )}
      {component.component_type === 'testimonial' && (
        <TestimonialComponent data={component.data} />
      )}
      {component.component_type === 'hours' && (
        <HoursComponent data={component.data} />
      )}
      {component.component_type === 'contact_form' && (
        <ContactFormComponent data={component.data} />
      )}
      {component.component_type === 'map' && (
        <MapComponent data={component.data} />
      )}
    </section>
  )
}

function HeroComponent({ data }: { data: any }) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-12 rounded-lg">
      <h2 className="text-4xl font-bold mb-4">
        {data.slides?.[0]?.title || 'Hero'}
      </h2>
      <p className="text-xl">{data.slides?.[0]?.subtitle || 'Subtitle'}</p>
    </div>
  )
}

function ServicesComponent({ data }: { data: any }) {
  return (
    <div className="py-12">
      <h2 className="text-3xl font-bold text-center mb-8">
        {data.title || 'Usługi'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.items?.map((item: any, index: number) => (
          <div key={index} className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
            <p className="text-gray-600">{item.description}</p>
            {item.price && (
              <p className="text-lg font-bold mt-2">{item.price}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function PricingComponent({ data }: { data: any }) {
  return (
    <div className="py-12">
      <h2 className="text-3xl font-bold text-center mb-8">
        {data.title || 'Cennik'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.services?.map((service: any, index: number) => (
          <div key={index} className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
            <p className="text-3xl font-bold text-blue-600 mb-4">
              {service.price} zł
            </p>
            <p className="text-gray-600">{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function TeamComponent({ data }: { data: any }) {
  return (
    <div className="py-12">
      <h2 className="text-3xl font-bold text-center mb-8">
        {data.title || 'Zespół'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.members?.map((member: any, index: number) => (
          <div key={index} className="text-center">
            <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-full"></div>
            <h3 className="text-xl font-semibold">{member.name}</h3>
            <p className="text-gray-600">{member.role}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function TestimonialComponent({ data }: { data: any }) {
  return (
    <div className="py-12 bg-gray-50">
      <h2 className="text-3xl font-bold text-center mb-8">
        {data.title || 'Opinie'}
      </h2>
      <div className="max-w-4xl mx-auto space-y-6">
        {data.items?.map((item: any, index: number) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow">
            <p className="text-lg mb-4 italic">"{item.quote}"</p>
            <p className="font-semibold">{item.author}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function HoursComponent({ data }: { data: any }) {
  return (
    <div className="py-12">
      <h2 className="text-3xl font-bold text-center mb-8">
        {data.title || 'Godziny otwarcia'}
      </h2>
      <div className="max-w-md mx-auto space-y-2">
        {data.hours?.map((hour: any, index: number) => (
          <div key={index} className="flex justify-between p-3 border-b">
            <span className="font-medium">{hour.days}</span>
            <span className={hour.closed ? 'text-red-600' : 'text-gray-700'}>
              {hour.closed ? 'Nieczynne' : hour.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ContactFormComponent({ data }: { data: any }) {
  return (
    <div className="py-12">
      <h2 className="text-3xl font-bold text-center mb-8">
        {data.title || 'Kontakt'}
      </h2>
      <p className="text-center text-gray-600 mb-4">
        Formularz kontaktowy (wyłączony w podglądzie)
      </p>
    </div>
  )
}

function extractYouTubeId(url: string): string {
  const match = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  )
  return match ? match[1] : ''
}

function extractVimeoId(url: string): string {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? match[1] : ''
}
