interface PdfSectionProps {
  mediaUrl: string
  thumbnailUrl?: string
  title?: string
}

export default function PdfSection({ mediaUrl, thumbnailUrl, title }: PdfSectionProps) {
  return (
    <div className="pdf-section d-flex align-items-center gap-3 p-3 border rounded bg-light">
      {thumbnailUrl && (
        <img
          src={thumbnailUrl}
          alt={title || 'Podglad PDF'}
          className="pdf-thumbnail rounded"
          style={{ width: '80px', height: '80px', objectFit: 'cover' }}
        />
      )}
      <div className="pdf-info flex-grow-1">
        {title && <h5 className="pdf-title mb-2">{title}</h5>}
        <a
          href={mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-sm"
        >
          <i className="bi bi-download me-2"></i>
          Pobierz PDF
        </a>
      </div>
    </div>
  )
}
