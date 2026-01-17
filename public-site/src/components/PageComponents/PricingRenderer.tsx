import type { PricingComponentData } from '../../types'

interface PricingRendererProps {
  data: PricingComponentData
  getMediaUrl: (mediaId: string | undefined) => string
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
          <div className="col-lg-8">
            <div className="pricing-table bg-white shadow-sm rounded p-4">
              <table className="table table-hover mb-0">
                <tbody>
                  {services.map((service, idx) => (
                    <tr key={idx}>
                      <td className="align-middle">
                        <strong>{service.name}</strong>
                        {service.description && (
                          <small className="d-block text-muted">{service.description}</small>
                        )}
                      </td>
                      <td className="align-middle text-end" style={{ whiteSpace: 'nowrap' }}>
                        <span className="text-primary font-weight-bold">{service.price}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
