interface TextSectionProps {
  body: string
}

export default function TextSection({ body }: TextSectionProps) {
  return (
    <div
      className="text-section content-body"
      dangerouslySetInnerHTML={{ __html: body }}
    />
  )
}
