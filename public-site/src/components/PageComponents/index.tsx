import type { PageComponent } from '../../types'
import HeroRenderer from './HeroRenderer'
import ServicesRenderer from './ServicesRenderer'
import TestimonialsRenderer from './TestimonialsRenderer'
import TeamRenderer from './TeamRenderer'
import PricingRenderer from './PricingRenderer'
import HoursRenderer from './HoursRenderer'
import ContactFormRenderer from './ContactFormRenderer'
import MapRenderer from './MapRenderer'

interface ComponentRendererProps {
  component: PageComponent
}

export function ComponentRenderer({ component }: ComponentRendererProps) {
  if (!component.status) return null

  switch (component.component_type) {
    case 'hero':
      return <HeroRenderer data={component.data as any} />
    case 'services':
      return <ServicesRenderer data={component.data as any} />
    case 'testimonial':
      return <TestimonialsRenderer data={component.data as any} />
    case 'team':
      return <TeamRenderer data={component.data as any} />
    case 'pricing':
      return <PricingRenderer data={component.data as any} />
    case 'hours':
      return <HoursRenderer data={component.data as any} />
    case 'contact_form':
      return <ContactFormRenderer data={component.data as any} />
    case 'map':
      return <MapRenderer data={component.data as any} />
    default:
      console.warn(`Unknown component type: ${component.component_type}`)
      return null
  }
}

interface PageComponentsListProps {
  components: PageComponent[]
}

export function PageComponentsList({ components }: PageComponentsListProps) {
  if (!components || components.length === 0) {
    return null
  }

  const sortedComponents = [...components]
    .filter((c) => c.status)
    .sort((a, b) => a.order_index - b.order_index)

  return (
    <>
      {sortedComponents.map((component) => (
        <ComponentRenderer key={component.component_id} component={component} />
      ))}
    </>
  )
}

export {
  HeroRenderer,
  ServicesRenderer,
  TestimonialsRenderer,
  TeamRenderer,
  PricingRenderer,
  HoursRenderer,
  ContactFormRenderer,
  MapRenderer,
}
