import type { HoursComponentData } from '../../types'

interface HoursRendererProps {
  data: HoursComponentData
}

export default function HoursRenderer({ data }: HoursRendererProps) {
  const { title, hours = [], specialNote } = data

  if (hours.length === 0) return null

  return (
    <div className="site-section bg-light">
      <div className="container">
        {title && (
          <div className="row mb-4">
            <div className="col-12 text-center">
              <h2 className="site-section-heading">{title}</h2>
            </div>
          </div>
        )}

        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="hours-card bg-white p-4 rounded shadow-sm">
              <table className="table table-borderless mb-0">
                <tbody>
                  {hours.map((hour, idx) => (
                    <tr key={idx}>
                      <td className={`font-weight-bold ${hour.closed ? 'text-muted' : ''}`}>
                        {hour.days}
                      </td>
                      <td className="text-end">
                        {hour.closed ? (
                          <span
                            className="badge"
                            style={{
                              backgroundColor: '#dc3545',
                              color: 'white',
                            }}
                          >
                            Zamknięte
                          </span>
                        ) : (
                          <span className="text-dark">{hour.time}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {specialNote && (
                <div className="mt-3 p-3 bg-light rounded">
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-2"></i>
                    {specialNote}
                  </small>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
