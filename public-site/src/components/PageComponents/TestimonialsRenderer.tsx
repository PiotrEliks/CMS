import { useState, useEffect } from 'react'
import { getMediaUrl } from '../../api/axios'
import type { TestimonialComponentData } from '../../types'

interface TestimonialsRendererProps {
  data: TestimonialComponentData
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="star-rating mb-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            color: star <= rating ? '#ffc107' : '#e0e0e0',
            fontSize: '1.25rem',
          }}
        >
          ★
        </span>
      ))}
    </div>
  )
}

export default function TestimonialsRenderer({ data }: TestimonialsRendererProps) {
  const { title, items = [], layout = 'slider' } = data
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    if (layout === 'slider' && items.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % items.length)
      }, 6000)
      return () => clearInterval(interval)
    }
  }, [layout, items.length])

  if (items.length === 0) return null

  if (layout === 'slider') {
    const item = items[currentSlide]
    return (
      <div className="site-section bg-light">
        <div className="container">
          {title && (
            <div className="row mb-5">
              <div className="col-12 text-center">
                <h2 className="site-section-heading">{title}</h2>
              </div>
            </div>
          )}

          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              {item.media_id && (
                <img
                  src={getMediaUrl(`/uploads/media/${item.media_id}`)}
                  alt={item.author}
                  className="rounded-circle mb-3"
                  style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                />
              )}
              {item.rating && <StarRating rating={item.rating} />}
              <blockquote className="blockquote mb-4">
                <p className="mb-0 font-italic" style={{ fontSize: '1.25rem' }}>
                  "{item.quote}"
                </p>
              </blockquote>
              <div className="testimonial-author">
                <strong>{item.author}</strong>
                {(item.role || item.company) && (
                  <span className="text-muted d-block">
                    {item.role}
                    {item.role && item.company && ', '}
                    {item.company}
                  </span>
                )}
              </div>

              {items.length > 1 && (
                <div className="mt-4 d-flex justify-content-center gap-2">
                  {items.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`btn btn-sm ${idx === currentSlide ? 'btn-primary' : 'btn-outline-primary'}`}
                      style={{ width: '12px', height: '12px', padding: 0, borderRadius: '50%' }}
                      aria-label={`Opinia ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Grid layout
  return (
    <div className="site-section bg-light">
      <div className="container">
        {title && (
          <div className="row mb-5">
            <div className="col-12 text-center">
              <h2 className="site-section-heading">{title}</h2>
            </div>
          </div>
        )}

        <div className="row">
          {items.map((item, idx) => (
            <div key={idx} className="col-md-6 col-lg-4 mb-4">
              <div className="testimonial-card h-100 p-4 bg-white rounded shadow-sm">
                <div className="d-flex align-items-center mb-3">
                  {item.media_id && (
                    <img
                      src={getMediaUrl(`/uploads/media/${item.media_id}`)}
                      alt={item.author}
                      className="rounded-circle me-3"
                      style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                    />
                  )}
                  <div>
                    <strong>{item.author}</strong>
                    {(item.role || item.company) && (
                      <span className="text-muted d-block small">
                        {item.role}
                        {item.role && item.company && ', '}
                        {item.company}
                      </span>
                    )}
                  </div>
                </div>
                {item.rating && <StarRating rating={item.rating} />}
                <p className="mb-0 font-italic">"{item.quote}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
