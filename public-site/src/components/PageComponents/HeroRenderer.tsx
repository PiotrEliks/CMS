import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMediaUrl } from '../../api/axios'
import type { HeroComponentData } from '../../types'

interface HeroRendererProps {
  data: HeroComponentData
}

export default function HeroRenderer({ data }: HeroRendererProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const slides = data.slides || []

  useEffect(() => {
    if (data.autoplay !== false && slides.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
      }, data.interval || 5000)
      return () => clearInterval(interval)
    }
  }, [data.autoplay, data.interval, slides.length])

  if (slides.length === 0) return null

  const slide = slides[currentSlide]
  const overlayOpacity = (slide.overlayOpacity ?? 50) / 100
  const backgroundImage = slide.media_id
    ? getMediaUrl(`/uploads/media/${slide.media_id}`)
    : '/images/hero_bg_1.jpg'

  return (
    <div
      className="site-blocks-cover"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        minHeight: '500px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
        }}
      />

      <div
        className="container"
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '500px',
        }}
      >
        <div className="row align-items-center justify-content-center text-center w-100">
          <div className="col-md-10 col-lg-8">
            {slide.subtitle && (
              <span className="d-block text-white text-uppercase font-weight-light letter-spacing mb-3">
                {slide.subtitle}
              </span>
            )}
            <h1
              className="text-white font-weight-light mb-3"
              style={{
                fontSize: 'clamp(1.8rem, 5vw, 3.5rem)',
                lineHeight: 1.2,
                wordBreak: 'break-word',
              }}
            >
              {slide.title}
            </h1>
            {slide.description && (
              <p className="text-white mb-4" style={{ fontSize: '1.25rem' }}>
                {slide.description}
              </p>
            )}
            {slide.buttonText && slide.buttonLink && (
              <Link to={slide.buttonLink} className="btn btn-primary btn-lg py-3 px-5">
                {slide.buttonText}
              </Link>
            )}
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <div
          className="slide-indicators"
          style={{
            position: 'absolute',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '10px',
            zIndex: 2,
          }}
        >
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                border: '2px solid white',
                backgroundColor: idx === currentSlide ? 'white' : 'transparent',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
              }}
              aria-label={`Slajd ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
