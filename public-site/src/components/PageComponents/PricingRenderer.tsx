import { getMediaUrl } from '../../api/axios'
import type { PricingComponentData } from '../../types'

interface PricingRendererProps {
  data: PricingComponentData
}

export default function PricingRenderer({ data }: PricingRendererProps) {
  const { title, subtitle, services = [] } = data

  if (services.length === 0) return null

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

        <div className="row justify-content-center">
          {services.map((service, idx) => (
            <div key={idx} className="col-md-6 col-lg-4 mb-4">
              <div className="pricing-card h-100 text-center p-4 bg-white shadow-sm rounded border">
                {service.media_id && (
                  <img
                    src={getMediaUrl(`/uploads/media/${service.media_id}`)}
                    alt={service.name}
                    className="mb-3 rounded"
                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                  />
                )}
                <h4 className="mb-3">{service.name}</h4>
                <div
                  className="price mb-3"
                  style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}
                >
                  {service.price}
                </div>
                {service.description && (
                  <p className="text-muted">{service.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
