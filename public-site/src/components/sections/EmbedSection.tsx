interface EmbedSectionProps {
  embedCode: string
}

export default function EmbedSection({ embedCode }: EmbedSectionProps) {
  return (
    <div
      className="embed-section"
      dangerouslySetInnerHTML={{ __html: embedCode }}
    />
  )
}
