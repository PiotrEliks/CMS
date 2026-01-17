interface SectionWrapperProps {
  heading?: string
  subheading?: string
  children: React.ReactNode
  className?: string
}

export default function SectionWrapper({
  heading,
  subheading,
  children,
  className = '',
}: SectionWrapperProps) {
  return (
    <div className={`section-wrapper mb-4 ${className}`}>
      {heading && <h2 className="section-heading h4 mb-2">{heading}</h2>}
      {subheading && <p className="section-subheading text-muted mb-3">{subheading}</p>}
      <div className="section-content">{children}</div>
    </div>
  )
}
