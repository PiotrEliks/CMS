interface ImageSectionProps {
  mediaUrl: string
  alt?: string
  title?: string
  link?: string
}

export default function ImageSection({ mediaUrl, alt, title, link }: ImageSectionProps) {
  const image = (
    <img
      src={mediaUrl}
      alt={alt || title || 'Obraz'}
      title={title}
      className="img-fluid rounded shadow-sm"
      style={{ width: '100%', height: 'auto' }}
    />
  )

  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className="image-section d-block">
        {image}
      </a>
    )
  }

  return <div className="image-section">{image}</div>
}
