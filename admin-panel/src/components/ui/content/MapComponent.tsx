import { useState } from 'react'

interface MapComponentProps {
    data: {
        title?: string
        latitude: number
        longitude: number
        zoom?: number
        marker?: boolean
        markerTitle?: string
        height?: string
        provider?: 'google' | 'openstreetmap'
    }
}

export default function MapComponent({ data }: MapComponentProps) {
    const {
        title,
        latitude,
        longitude,
        zoom = 15,
        marker = true,
        markerTitle,
        height = '400px',
        provider = 'openstreetmap',
    } = data

    const [mapError, setMapError] = useState(false)

    const getGoogleMapsEmbedUrl = () => {
        const query = `${latitude},${longitude}`
        return `https://maps.google.com/maps?q=${query}&t=m&z=${zoom}&output=embed&iwloc=near`
    }

    const getOpenStreetMapUrl = () => {
        return `https://www.openstreetmap.org/export/embed.html?bbox=${
            longitude - 0.01
        },${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&layer=mapnik&marker=${latitude},${longitude}`
    }

    const getGoogleMapsLink = () => {
        return `https://www.google.com/maps?q=${latitude},${longitude}&z=${zoom}`
    }

    return (
        <div className="py-12">
            {title && (
                <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
                    {title}
                </h2>
            )}

            <div
                className="relative rounded-lg overflow-hidden shadow-lg"
                style={{ height }}
            >
                {!mapError ? (
                    <iframe
                        src={
                            provider === 'google'
                                ? getGoogleMapsEmbedUrl()
                                : getOpenStreetMapUrl()
                        }
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        onError={() => setMapError(true)}
                        title={markerTitle || 'Map'}
                    />
                ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center p-8">
                        <div className="text-center mb-4">
                            <svg
                                className="w-16 h-16 mx-auto text-gray-400 mb-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                            </svg>
                            <p className="text-gray-600 dark:text-gray-400 mb-2">
                                Współrzędne: {latitude.toFixed(6)},{' '}
                                {longitude.toFixed(6)}
                            </p>
                            {markerTitle && (
                                <p className="text-gray-700 dark:text-gray-300 font-medium mb-4">
                                    {markerTitle}
                                </p>
                            )}
                        </div>
                        <a
                            href={getGoogleMapsLink()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                            </svg>
                            Otwórz w Google Maps
                        </a>
                    </div>
                )}
            </div>
        </div>
    )
}
