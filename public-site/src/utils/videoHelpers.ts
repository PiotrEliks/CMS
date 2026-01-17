export function extractYouTubeId(url: string): string {
  const match = url.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  )
  return match ? match[1] : ''
}

export function extractVimeoId(url: string): string {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? match[1] : ''
}

export function getVideoEmbedUrl(
  url: string,
  provider?: 'youtube' | 'vimeo' | 'custom',
  autoplay?: boolean
): string {
  const autoplayParam = autoplay ? '?autoplay=1' : ''

  if (provider === 'youtube' || url.includes('youtube') || url.includes('youtu.be')) {
    const videoId = extractYouTubeId(url)
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}${autoplayParam}`
    }
  }

  if (provider === 'vimeo' || url.includes('vimeo')) {
    const videoId = extractVimeoId(url)
    if (videoId) {
      return `https://player.vimeo.com/video/${videoId}${autoplayParam}`
    }
  }

  return url
}

export function isVideoUrl(url: string): boolean {
  return (
    url.includes('youtube') ||
    url.includes('youtu.be') ||
    url.includes('vimeo') ||
    url.endsWith('.mp4') ||
    url.endsWith('.webm') ||
    url.endsWith('.ogg')
  )
}

export function getVideoProvider(url: string): 'youtube' | 'vimeo' | 'custom' {
  if (url.includes('youtube') || url.includes('youtu.be')) {
    return 'youtube'
  }
  if (url.includes('vimeo')) {
    return 'vimeo'
  }
  return 'custom'
}
