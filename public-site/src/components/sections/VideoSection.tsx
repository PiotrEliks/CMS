import { getVideoEmbedUrl, getVideoProvider } from '../../utils/videoHelpers'

interface VideoSectionProps {
  videoUrl: string
  provider?: 'youtube' | 'vimeo' | 'custom'
  autoplay?: boolean
}

export default function VideoSection({ videoUrl, provider, autoplay }: VideoSectionProps) {
  const actualProvider = provider || getVideoProvider(videoUrl)

  if (actualProvider === 'custom') {
    return (
      <div className="video-section">
        <video
          src={videoUrl}
          controls
          autoPlay={autoplay}
          muted={autoplay}
          className="w-100 rounded shadow-sm"
          style={{ maxHeight: '500px' }}
        >
          Twoja przegladarka nie obsluguje odtwarzania wideo.
        </video>
      </div>
    )
  }

  const embedUrl = getVideoEmbedUrl(videoUrl, actualProvider, autoplay)

  return (
    <div
      className="video-section"
      style={{
        position: 'relative',
        paddingBottom: '56.25%',
        height: 0,
        overflow: 'hidden',
      }}
    >
      <iframe
        src={embedUrl}
        title="Wideo"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '0.5rem',
        }}
      />
    </div>
  )
}
