import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { MapComponentData } from '../../types'

// Fix Leaflet default icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png'

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

interface MapRendererProps {
  data: MapComponentData
}

export default function MapRenderer({ data }: MapRendererProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  const lat = data.latitude || 52.2297 // Default: Warsaw
  const lng = data.longitude || 21.0122
  const zoom = data.zoom || 15
  const height = data.height || '400px'

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Initialize map
    const map = L.map(mapRef.current).setView([lat, lng], zoom)
    mapInstanceRef.current = map

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    // Add marker if enabled (default is true)
    if (data.marker !== false) {
      const marker = L.marker([lat, lng]).addTo(map)
      if (data.markerTitle) {
        marker.bindPopup(data.markerTitle).openPopup()
      }
    }

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [lat, lng, zoom, data.marker, data.markerTitle])

  return (
    <div className="site-section py-0">
      {data.title && (
        <div className="container py-4">
          <h2 className="site-section-heading text-center">{data.title}</h2>
        </div>
      )}
      <div
        ref={mapRef}
        style={{
          height,
          width: '100%',
          minHeight: '300px',
        }}
      />
    </div>
  )
}
