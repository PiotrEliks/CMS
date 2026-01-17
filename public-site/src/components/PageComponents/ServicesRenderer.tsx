import { Link } from 'react-router-dom'
import type { ServicesComponentData } from '../../types'

interface ServicesRendererProps {
  data: ServicesComponentData
  getMediaUrl: (mediaId: string | undefined) => string
}

export default function ServicesRenderer({ data, getMediaUrl }: ServicesRendererProps) {
  const { title, subtitle, items = [], layout = 'grid', columns = 3 } = data

  if (items.length === 0) return null

  const colClass =
    columns === 2 ? 'col-md-6' : columns === 4 ? 'col-md-3' : columns === 1 ? 'col-12' : 'col-md-4'

  return (
    <div className="site-section">
      <div className="container">
        {(title || subtitle) && (
          <div className="row mb-5">
            <div className="col-12 text-center">
              {title && <h2 className="site-section-heading">{title}</h2>}
              {subtitle && <p className="text-muted">{subtitle}</p>}
            </div>
          </div>
        )}

        {layout === 'list' ? (
          <div className="services-list">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="service-item d-flex align-items-center mb-4 p-3 bg-light rounded"
              >
                {item.media_id && getMediaUrl(item.media_id) && (
                  <img
                    src={getMediaUrl(item.media_id)}
                    alt={item.name}
                    className="me-4 rounded"
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                  />
                )}
                {item.icon && !item.media_id && (
                  <span className="service-icon me-4 fs-1">{item.icon}</span>
                )}
                <div className="flex-grow-1">
                  <h4 className="mb-1">{item.name}</h4>
                  {item.description && <p className="text-muted mb-1">{item.description}</p>}
                  {item.price && <span className="badge bg-primary">{item.price}</span>}
                </div>
                {item.link && (
                  <Link to={item.link} className="btn btn-outline-primary ms-3">
                    Wiecej
                  </Link>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="row">
            {items.map((item, idx) => (
              <div key={idx} className={`${colClass} mb-4`}>
                <div className="service-card h-100 p-4 bg-white shadow-sm rounded text-center">
                  {item.media_id && getMediaUrl(item.media_id) && (
                    <img
                      src={getMediaUrl(item.media_id)}
                      alt={item.name}
                      className="mb-3 rounded"
                      style={{
                        width: '100%',
                        height: '180px',
                        objectFit: 'cover',
                      }}
                    />
                  )}
                  {item.icon && !item.media_id && (
                    <div className="service-icon mb-3 fs-1">{item.icon}</div>
                  )}
                  <h4 className="mb-2">{item.name}</h4>
                  {item.description && (
                    <p className="text-muted small mb-2">{item.description}</p>
                  )}
                  {item.price && (
                    <p className="text-primary font-weight-bold mb-3">{item.price}</p>
                  )}
                  {item.link && (
                    <Link to={item.link} className="btn btn-sm btn-outline-primary">
                      Wiecej
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
