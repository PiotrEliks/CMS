import type { ContentSection, SectionMedia } from '../../types'
import SectionWrapper from './SectionWrapper'
import TextSection from './TextSection'
import ImageSection from './ImageSection'
import GallerySection from './GallerySection'
import PdfSection from './PdfSection'
import VideoSection from './VideoSection'
import HtmlSection from './HtmlSection'
import EmbedSection from './EmbedSection'

interface SectionRendererProps {
  section: ContentSection
  mediaCache: Map<string, SectionMedia>
  getMediaUrl: (mediaId: string) => string
  getThumbnailUrl: (mediaId: string) => string
}

export default function SectionRenderer({
  section,
  mediaCache,
  getMediaUrl,
  getThumbnailUrl,
}: SectionRendererProps) {
  if (!section.status) return null

  const renderContent = () => {
    switch (section.section_type) {
      case 'text':
        return <TextSection body={section.body || ''} />

      case 'image':
        { if (!section.media_ids[0]) return null
        const imageMedia = mediaCache.get(section.media_ids[0])
        return (
          <ImageSection
            mediaUrl={getMediaUrl(section.media_ids[0])}
            alt={imageMedia?.alt_text || section.heading}
            title={imageMedia?.title}
            link={section.settings?.link}
          />
        ) }

      case 'gallery':
        if (!section.media_ids || section.media_ids.length === 0) return null
        const galleryImages = section.media_ids.map((id) => {
          const media = mediaCache.get(id)
          return {
            url: getMediaUrl(id),
            alt: media?.alt_text,
          }
        })
        return (
          <GallerySection
            images={galleryImages}
            layout={section.settings?.layout}
            columns={section.settings?.columns || 3}
          />
        )

      case 'pdf':
        if (!section.media_ids[0]) return null
        const pdfMedia = mediaCache.get(section.media_ids[0])
        return (
          <PdfSection
            mediaUrl={getMediaUrl(section.media_ids[0])}
            thumbnailUrl={getThumbnailUrl(section.media_ids[0])}
            title={pdfMedia?.title || section.heading}
          />
        )

      case 'video':
        const videoUrl = section.settings?.video_url || section.body
        if (!videoUrl) return null
        return (
          <VideoSection
            videoUrl={videoUrl}
            provider={section.settings?.video_provider}
            autoplay={section.settings?.autoplay}
          />
        )

      case 'html':
        return <HtmlSection body={section.body || ''} />

      case 'embed':
        const embedCode = section.settings?.embed_code || section.body
        if (!embedCode) return null
        return <EmbedSection embedCode={embedCode} />

      default:
        console.warn(`Unknown section type: ${section.section_type}`)
        return null
    }
  }

  const content = renderContent()
  if (!content) return null

  return (
    <SectionWrapper heading={section.heading} subheading={section.subheading}>
      {content}
    </SectionWrapper>
  )
}

export { SectionWrapper, TextSection, ImageSection, GallerySection, PdfSection, VideoSection, HtmlSection, EmbedSection }
