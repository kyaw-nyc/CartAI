'use client'

import { useState, useCallback } from 'react'
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api'
import { darkMapStyles, MANHATTAN_CENTER, MANHATTAN_BOUNDS } from '@/lib/config/map-styles'

interface Store {
  id: string
  name: string
  position: {
    lat: number
    lng: number
  }
  category: string
}

interface MapViewProps {
  onStoreClick?: (storeId: string) => void
}

/**
 * Dark-themed Google Map component focused on Manhattan
 * Shows sustainable stores that users can click to start negotiations
 */
export function MapView({ onStoreClick }: MapViewProps) {
  const [selectedStore, setSelectedStore] = useState<string | null>(null)

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

  // Load Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
  })

  // Sample stores in Manhattan (you'll replace this with real data later)
  const stores: Store[] = [
    {
      id: 'store_1',
      name: 'EcoSupply Manhattan',
      position: { lat: 40.7589, lng: -73.9851 },
      category: 'premium',
    },
    {
      id: 'store_2',
      name: 'QuickShip NYC',
      position: { lat: 40.7614, lng: -73.9776 },
      category: 'fast',
    },
    {
      id: 'store_3',
      name: 'ValueGreen Midtown',
      position: { lat: 40.7549, lng: -73.9840 },
      category: 'budget',
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

  const handleMarkerClick = useCallback(
    (storeId: string) => {
      setSelectedStore(storeId)
      if (onStoreClick) {
        onStoreClick(storeId)
      }
    },
    [onStoreClick]
  )

  // Custom marker icon creator (only after map loads)
  const getMarkerIcon = (store: Store) => {
    if (!isLoaded || typeof window === 'undefined' || !window.google) {
      return undefined
    }

    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: selectedStore === store.id ? 12 : 8,
      fillColor: selectedStore === store.id ? '#10b981' : '#3b82f6',
      fillOpacity: 0.9,
      strokeColor: '#ffffff',
      strokeWeight: 2,
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
    return (
      <div className="flex h-full w-full items-center justify-center bg-black/40 backdrop-blur-md border border-white/10 rounded-xl">
        <div className="text-center p-8">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white mx-auto"></div>
          <p className="text-white/60">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-white/10">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={MANHATTAN_CENTER}
        zoom={13}
        options={options}
      >
        {stores.map((store) => (
          <Marker
            key={store.id}
            position={store.position}
            onClick={() => handleMarkerClick(store.id)}
            title={store.name}
            icon={getMarkerIcon(store)}
          />
        ))}
      </GoogleMap>
    </div>
  )
}
