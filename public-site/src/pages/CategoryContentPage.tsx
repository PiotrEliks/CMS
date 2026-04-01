/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/axios'
import Hero from '../components/Hero'
import SectionRenderer from '../components/sections'
import { PageComponentsList } from '../components/PageComponents'
import { useMediaCache } from '../hooks/useMediaCache'
import type { Content } from '../types'

export default function CategoryContentPage() {
  const { categorySlug, pageSlug } = useParams<{ categorySlug: string; pageSlug: string }>()
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { mediaCache, fetchMediaForSections, getMediaUrl, getThumbnailUrl } = useMediaCache()

  useEffect(() => {
    const fetchContent = async () => {
      if (!categorySlug || !pageSlug) return

      setLoading(true)
      setError(null)
      try {
        const res = await api.get(`/contents/${categorySlug}/${pageSlug}/full`)
        const data = res.data.content || res.data
        setContent(data)

        if (data.sections && data.sections.length > 0) {
          await fetchMediaForSections(data.sections)
        }
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setError('Strona nie została znaleziona')
        } else {
          setError('Nie udało się załadować strony')
        }
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [fetchMediaForSections, categorySlug, pageSlug])

  if (loading) {
    return (
      <>
        <Hero title="Ładowanie..." backgroundImage="/images/hero_bg_2.jpg" />
        <div className="site-section">
          <div className="container">
            <div className="text-center py-5">
              <p>Ładowanie strony...</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (error || !content) {
    return (
      <>
        <Hero title="Błąd" backgroundImage="/images/hero_bg_2.jpg" />
        <div className="site-section">
          <div className="container">
            <div className="text-center py-5">
              <p className="text-danger">{error || 'Strona nie istnieje'}</p>
              <Link to="/" className="btn btn-primary mt-3">
                Wróć na stronę główną
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  const coverImage = content.cover_media?.url || '/images/hero_bg_1.jpg'
  const hasHeroComponent = content.components?.some((c) => c.component_type === 'hero')

  // Combine components and sections, sort by display_order (set in admin panel)
  const allItems = [
    ...(content.components || []).filter(c => c.status).map(c => ({ ...c, _type: 'component' as const })),
    ...(content.sections || []).filter(s => s.status).map(s => ({ ...s, _type: 'section' as const })),
  ].sort((a, b) => (a.display_order ?? a.order_index) - (b.display_order ?? b.order_index))

  return (
    <>
      {/* Show default hero only if no hero component exists */}
      {!hasHeroComponent && <Hero title={content.title} backgroundImage={coverImage} />}

      {allItems.length > 0 ? (
        allItems.map((item) => {
          if (item._type === 'component') {
            return <PageComponentsList key={item.component_id} components={[item]} />
          } else {
            return (
              <div key={item.section_id} className="site-section">
                <div className="container">
                  <div className="row justify-content-center">
                    <div className="col-lg-8">
                      <SectionRenderer
                        section={item}
                        mediaCache={mediaCache}
                        getMediaUrl={getMediaUrl}
                        getThumbnailUrl={getThumbnailUrl}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          }
        })
      ) : content.body ? (
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
      ) : null}
    </>
  )
}
