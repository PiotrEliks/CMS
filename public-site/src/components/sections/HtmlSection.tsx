interface HtmlSectionProps {
  body: string
}

export default function HtmlSection({ body }: HtmlSectionProps) {
  return (
    <div
      className="html-section"
      dangerouslySetInnerHTML={{ __html: body }}
    />
  )
}
