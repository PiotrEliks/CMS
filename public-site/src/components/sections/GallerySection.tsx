interface GalleryImage {
  url: string
  alt?: string
}

interface GallerySectionProps {
  images: GalleryImage[]
  layout?: 'grid' | 'carousel' | 'masonry'
  columns?: number
}

export default function GallerySection({
  images,
  layout = 'grid',
  columns = 3,
}: GallerySectionProps) {
  if (!images || images.length === 0) return null

  if (layout === 'masonry') {
    return (
      <div
        className="gallery-section gallery-masonry"
        style={{
          columnCount: columns,
          columnGap: '1rem',
        }}
      >
        {images.map((img, idx) => (
          <div key={idx} className="gallery-item mb-3" style={{ breakInside: 'avoid' }}>
            <img
              src={img.url}
              alt={img.alt || `Galeria ${idx + 1}`}
              className="img-fluid rounded shadow-sm w-100"
            />
          </div>
        ))}
      </div>
    )
  }

  // Grid layout (default)
  const colClass = columns === 2 ? 'col-md-6' : columns === 4 ? 'col-md-3' : 'col-md-4'

  return (
    <div className="gallery-section">
      <div className="row g-3">
        {images.map((img, idx) => (
          <div key={idx} className={colClass}>
            <div className="gallery-item">
              <img
                src={img.url}
                alt={img.alt || `Galeria ${idx + 1}`}
                className="img-fluid rounded shadow-sm w-100"
                style={{ transition: 'transform 0.3s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
