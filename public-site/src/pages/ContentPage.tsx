import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/axios'
import Hero from '../components/Hero'
import SectionRenderer from '../components/sections'
import { PageComponentsList } from '../components/PageComponents'
import { useMediaCache } from '../hooks/useMediaCache'
import type { Content } from '../types'

export default function ContentPage() {
  const { slug } = useParams<{ slug: string }>()
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { mediaCache, fetchMediaForSections, getMediaUrl, getThumbnailUrl } = useMediaCache()

  useEffect(() => {
    const fetchContent = async () => {
      if (!slug) return

      setLoading(true)
      setError(null)
      try {
        // Fetch full content with sections and components
        const res = await api.get(`/contents/${slug}/full`)
        const data = res.data.content || res.data
        setContent(data)

        // Fetch media for sections
        if (data.sections && data.sections.length > 0) {
          await fetchMediaForSections(data.sections)
        }
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setError('Strona nie zostala znaleziona')
        } else {
          setError('Nie udalo sie zaladowac strony')
        }
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [slug])

  if (loading) {
    return (
      <>
        <Hero title="Ladowanie..." backgroundImage="/images/hero_bg_2.jpg" />
        <div className="site-section">
          <div className="container">
            <div className="text-center py-5">
              <p>Ladowanie strony...</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (error || !content) {
    return (
      <>
        <Hero title="Blad" backgroundImage="/images/hero_bg_2.jpg" />
        <div className="site-section">
          <div className="container">
            <div className="text-center py-5">
              <p className="text-danger">{error || 'Strona nie istnieje'}</p>
              <Link to="/" className="btn btn-primary mt-3">
                Wroc na strone glowna
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  const coverImage = content.cover_media?.url || '/images/hero_bg_1.jpg'
  const hasSections = content.sections && content.sections.length > 0
  const hasComponents = content.components && content.components.length > 0
  const hasHeroComponent = content.components?.some((c) => c.component_type === 'hero')

  return (
    <>
      {/* Show default hero only if no hero component exists */}
      {!hasHeroComponent && <Hero title={content.title} backgroundImage={coverImage} />}

      {/* Render page components (hero, services, testimonials, etc.) */}
      {hasComponents && <PageComponentsList components={content.components!} />}

      {/* Render sections (text, image, gallery, video, etc.) */}
      {hasSections && (
        <div className="site-section">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                {content.sections!
                  .filter((s) => s.status)
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((section) => (
                    <SectionRenderer
                      key={section.section_id}
                      section={section}
                      mediaCache={mediaCache}
                      getMediaUrl={getMediaUrl}
                      getThumbnailUrl={getThumbnailUrl}
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fallback: render body HTML if no sections or components */}
      {!hasSections && !hasComponents && content.body && (
        <div className="site-section">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <article
                  className="content-body"
                  dangerouslySetInnerHTML={{ __html: content.body }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
