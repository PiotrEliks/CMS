import type { TeamComponentData } from '../../types'

interface TeamRendererProps {
  data: TeamComponentData
  getMediaUrl: (mediaId: string | undefined) => string
}

export default function TeamRenderer({ data, getMediaUrl }: TeamRendererProps) {
  const { title, subtitle, members = [], layout = 'grid', columns = 3 } = data

  if (members.length === 0) return null

  const colClass =
    columns === 2 ? 'col-md-6' : columns === 4 ? 'col-md-3' : 'col-md-4'

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
          <div className="team-list">
            {members.map((member, idx) => (
              <div
                key={idx}
                className="team-member d-flex align-items-start mb-4 p-4 bg-light rounded"
              >
                {member.media_id && getMediaUrl(member.media_id) && (
                  <img
                    src={getMediaUrl(member.media_id)}
                    alt={member.name}
                    className="rounded-circle me-4"
                    style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                  />
                )}
                <div className="flex-grow-1">
                  <h4 className="mb-1">{member.name}</h4>
                  <p className="text-primary mb-2">{member.role}</p>
                  {member.bio && <p className="text-muted mb-2">{member.bio}</p>}
                  <div className="contact-info mb-2">
                    {member.email && (
                      <a href={`mailto:${member.email}`} className="me-3 text-muted">
                        <i className="bi bi-envelope me-1"></i>
                        {member.email}
                      </a>
                    )}
                    {member.phone && (
                      <a href={`tel:${member.phone}`} className="text-muted">
                        <i className="bi bi-telephone me-1"></i>
                        {member.phone}
                      </a>
                    )}
                  </div>
                  {member.social && (
                    <div className="social-links">
                      {member.social.linkedin && (
                        <a
                          href={member.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="me-2"
                        >
                          <i className="bi bi-linkedin"></i>
                        </a>
                      )}
                      {member.social.twitter && (
                        <a
                          href={member.social.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="me-2"
                        >
                          <i className="bi bi-twitter"></i>
                        </a>
                      )}
                      {member.social.facebook && (
                        <a
                          href={member.social.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="me-2"
                        >
                          <i className="bi bi-facebook"></i>
                        </a>
                      )}
                      {member.social.instagram && (
                        <a
                          href={member.social.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="me-2"
                        >
                          <i className="bi bi-instagram"></i>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="row">
            {members.map((member, idx) => (
              <div key={idx} className={`${colClass} mb-4`}>
                <div className="team-card h-100 text-center p-4 bg-white shadow-sm rounded">
                  {member.media_id && getMediaUrl(member.media_id) && (
                    <img
                      src={getMediaUrl(member.media_id)}
                      alt={member.name}
                      className="rounded-circle mb-3"
                      style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                    />
                  )}
                  <h4 className="mb-1">{member.name}</h4>
                  <p className="text-primary mb-2">{member.role}</p>
                  {member.bio && (
                    <p className="text-muted small mb-3">{member.bio}</p>
                  )}
                  {member.social && (
                    <div className="social-links">
                      {member.social.linkedin && (
                        <a
                          href={member.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-secondary btn-sm mx-1"
                        >
                          <i className="bi bi-linkedin"></i>
                        </a>
                      )}
                      {member.social.twitter && (
                        <a
                          href={member.social.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-secondary btn-sm mx-1"
                        >
                          <i className="bi bi-twitter"></i>
                        </a>
                      )}
                      {member.social.facebook && (
                        <a
                          href={member.social.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-secondary btn-sm mx-1"
                        >
                          <i className="bi bi-facebook"></i>
                        </a>
                      )}
                      {member.social.instagram && (
                        <a
                          href={member.social.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-secondary btn-sm mx-1"
                        >
                          <i className="bi bi-instagram"></i>
                        </a>
                      )}
                    </div>
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
