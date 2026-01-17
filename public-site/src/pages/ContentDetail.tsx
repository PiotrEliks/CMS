import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/axios'
import Hero from '../components/Hero'
import SectionRenderer from '../components/sections'
import { PageComponentsList } from '../components/PageComponents'
import { useMediaCache } from '../hooks/useMediaCache'
import type { Content } from '../types'

export default function ContentDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { mediaCache, fetchMediaForSections, getMediaUrl, getThumbnailUrl } = useMediaCache()

  useEffect(() => {
    const fetchContent = async () => {
      if (!slug) return

      setLoading(true)
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
          setError('Artykul nie zostal znaleziony')
        } else {
          setError('Nie udalo sie zaladowac artykulu')
        }
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [slug])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <>
        <Hero title="Ladowanie..." backgroundImage="/images/hero_bg_2.jpg" />
        <div className="site-section">
          <div className="container">
            <div className="text-center py-5">
              <p>Ladowanie artykulu...</p>
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
              <p className="text-danger">{error || 'Artykul nie istnieje'}</p>
              <Link to="/artykuly" className="btn btn-primary mt-3">
                Wroc do artykulow
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

  return (
    <>
      {/* If there's a hero component, don't show the default hero */}
      {!hasComponents || !content.components?.some((c) => c.component_type === 'hero') ? (
        <Hero title={content.title} backgroundImage={coverImage} />
      ) : null}

      {/* Render page components */}
      {hasComponents && <PageComponentsList components={content.components!} />}

      <div className="site-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              {/* Meta info */}
              <div className="mb-4 pb-4 border-bottom">
                <span className="text-muted">
                  Opublikowano: {formatDate(content.published_at || content.created_at)}
                </span>
                {content.categories && content.categories.length > 0 && (
                  <span className="ms-4">
                    Kategorie:{' '}
                    {content.categories.map((cat, idx) => (
                      <span key={cat.category_id}>
                        <Link to={`/artykuly?kategoria=${cat.slug}`} className="text-primary">
                          {cat.name}
                        </Link>
                        {idx < content.categories!.length - 1 && ', '}
                      </span>
                    ))}
                  </span>
                )}
              </div>

              {/* Render sections if available, otherwise render body */}
              {hasSections ? (
                <div className="content-sections">
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
              ) : (
                <article className="content-body" dangerouslySetInnerHTML={{ __html: content.body }} />
              )}

              {/* Back link */}
              <div className="mt-5 pt-5 border-top">
                <Link to="/artykuly" className="btn btn-outline-primary">
                  &larr; Wroc do artykulow
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
