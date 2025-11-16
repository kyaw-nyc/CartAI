'use client'

import { useState, useCallback } from 'react'
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api'
import { darkMapStyles, MANHATTAN_CENTER, MANHATTAN_BOUNDS } from '@/lib/config/map-styles'

interface Store {
  id: string
  name: string
  position: {
    lat: number
    lng: number
  }
  category: string
  description: string
}

interface MapViewProps {
  onNegotiateClick?: (storeName: string, storeId: string) => void
}

/**
 * Dark-themed Google Map component focused on Manhattan
 * Shows sustainable stores that users can click to start negotiations
 */
export function MapView({ onNegotiateClick }: MapViewProps) {
  const [selectedStore, setSelectedStore] = useState<string | null>(null)

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

  // Load Google Maps script with proper ID to prevent double loading
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    id: 'google-map-script',
    preventGoogleFontsLoading: true,
  })

  // Real stores in Manhattan with their AI models
  const stores: Store[] = [
    {
      id: 'store_hm',
      name: 'H&M (GPT-4o)',
      position: { lat: 40.7589, lng: -73.9851 }, // Times Square
      category: 'fashion',
      description: 'Sustainable fashion at affordable prices',
    },
    {
      id: 'store_zara',
      name: 'Zara (Claude 3.5 Sonnet)',
      position: { lat: 40.7614, lng: -73.9776 }, // Central Park South
      category: 'fashion',
      description: 'Contemporary fashion and accessories',
    },
    {
      id: 'store_hugo',
      name: 'Hugo Boss (DeepSeek)',
      position: { lat: 40.7549, lng: -73.9840 }, // Midtown
      category: 'luxury',
      description: 'Premium menswear and accessories',
    },
  ]

  const mapContainerStyle = {
    width: '100%',
    height: '100%',
  }

  const options = {
    styles: darkMapStyles,
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: false,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: true,
    restriction: {
      latLngBounds: MANHATTAN_BOUNDS,
      strictBounds: false,
    },
    minZoom: 11,
  }

  const handleMarkerClick = useCallback((storeId: string) => {
    setSelectedStore(selectedStore === storeId ? null : storeId)
  }, [selectedStore])

  const handleNegotiate = useCallback((store: Store) => {
    if (onNegotiateClick) {
      onNegotiateClick(store.name, store.id)
    }
  }, [onNegotiateClick])

  // Custom marker icon using shop emoji
  const getMarkerIcon = (store: Store) => {
    if (!isLoaded || typeof window === 'undefined' || !window.google) {
      return undefined
    }

    const isActive = selectedStore === store.id

    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="22" fill="${isActive ? '#10b981' : '#3b82f6'}" stroke="#ffffff" stroke-width="3"/>
          <text x="24" y="30" font-size="20" text-anchor="middle" fill="#ffffff">🏪</text>
        </svg>
      `)}`,
      scaledSize: new window.google.maps.Size(48, 48),
      anchor: new window.google.maps.Point(24, 24),
    }
  }

  if (!apiKey) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black/40 backdrop-blur-md border border-white/10 rounded-xl">
        <div className="text-center p-8">
          <p className="text-red-400 font-medium mb-2">Google Maps API Key Missing</p>
          <p className="text-gray-400 text-sm">
            Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env file
          </p>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black/40 backdrop-blur-md border border-white/10 rounded-xl">
        <div className="text-center p-8">
          <p className="text-red-400 font-medium mb-2">Error Loading Maps</p>
          <p className="text-gray-400 text-sm">Please check your API key and try again</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    console.log('Google Maps is loading...', { isLoaded, loadError, apiKey: apiKey ? 'present' : 'missing' })
    return (
      <div className="flex h-full w-full items-center justify-center bg-black/40 backdrop-blur-md border border-white/10 rounded-xl">
        <div className="text-center p-8">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white mx-auto"></div>
          <p className="text-white/60">Loading map...</p>
          <p className="text-white/40 text-xs mt-2">This may take a few seconds</p>
        </div>
      </div>
    )
  }

  console.log('Google Maps loaded successfully!')

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-white/10">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={MANHATTAN_CENTER}
        zoom={13}
        options={options}
      >
        {stores.map((store) => (
          <div key={store.id}>
            <Marker
              position={store.position}
              onClick={() => handleMarkerClick(store.id)}
              icon={getMarkerIcon(store)}
            />

            {/* Info Window on click only - prevents flickering */}
            {selectedStore === store.id && (
              <InfoWindow
                position={store.position}
                onCloseClick={() => setSelectedStore(null)}
              >
                <div className="p-4 min-w-[220px] bg-white rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{store.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{store.description}</p>
                  <button
                    onClick={() => handleNegotiate(store)}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-blue-600 hover:border-2 hover:border-blue-600"
                  >
                    Negotiate
                  </button>
                </div>
              </InfoWindow>
            )}
          </div>
        ))}
      </GoogleMap>
    </div>
  )
}
