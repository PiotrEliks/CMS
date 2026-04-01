import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api, BACKEND_URL } from '../api/axios'
import Hero from '../components/Hero'

interface CategoryContent {
  content_id: string
  title: string
  slug: string
  lead?: string
  body?: string
  published_at?: string
  created_at: string
  cover?: {
    media_id: string
    storage_path: string
    alt_text?: string
    title?: string
  }
}

interface Category {
  category_id: string
  display_name: string
  slug: string
  contents?: CategoryContent[]
}

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategory = async () => {
      if (!slug) return

      setLoading(true)
      setError(null)
      try {
        const res = await api.get(`/category/${slug}`)
        setCategory(res.data)
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setError('Kategoria nie została znaleziona')
        } else {
          setError('Nie udało się załadować kategorii')
        }
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchCategory()
  }, [slug])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getImageUrl = (content: CategoryContent) => {
    if (content.cover?.storage_path) {
      return `${BACKEND_URL}${content.cover.storage_path}`
    }
    return '/images/img_1.jpg'
  }

  const getExcerpt = (content: CategoryContent) => {
    if (content.lead) return content.lead
    if (content.body) {
      return content.body.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
    }
    return ''
  }

  if (loading) {
    return (
      <>
        <Hero title="Ładowanie..." backgroundImage="/images/hero_bg_2.jpg" />
        <div className="site-section">
          <div className="container">
            <div className="text-center py-5">
              <p>Ładowanie kategorii...</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (error || !category) {
    return (
      <>
        <Hero title="Błąd" backgroundImage="/images/hero_bg_2.jpg" />
        <div className="site-section">
          <div className="container">
            <div className="text-center py-5">
              <p className="text-danger">{error || 'Kategoria nie istnieje'}</p>
              <Link to="/" className="btn btn-primary mt-3">
                Wróć na stronę główną
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  const contents = category.contents || []

  return (
    <>
      <Hero title={category.display_name} backgroundImage="/images/hero_bg_2.jpg" />

      <div className="site-section">
        <div className="container">
          {contents.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">Brak treści w tej kategorii.</p>
              <Link to="/" className="btn btn-primary mt-3">
                Wróć na stronę główną
              </Link>
            </div>
          ) : (
            <div className="row">
              {contents.map((content) => (
                <div key={content.content_id} className="col-md-6 col-lg-4 mb-5">
                  <div className="h-100 bg-white shadow-sm">
                    <Link to={`/${content.slug}`} className="d-block">
                      <figure className="hover-bg-enlarge mb-0">
                        <div
                          className="bg-image card-cover-image"
                          style={{ backgroundImage: `url(${getImageUrl(content)})` }}
                        ></div>
                      </figure>
                    </Link>
                    <div className="p-4">
                      <span className="text-primary small d-block mb-2">
                        {formatDate(content.published_at || content.created_at)}
                      </span>
                      <h3 className="h5 text-black mb-3">
                        <Link to={`/${content.slug}`} className="text-black">
                          {content.title}
                        </Link>
                      </h3>
                      <p className="text-muted small mb-3">{getExcerpt(content)}</p>
                      <Link to={`/${content.slug}`} className="text-primary small font-weight-bold">
                        Czytaj więcej &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
