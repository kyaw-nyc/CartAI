'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { MapView } from '@/components/map/MapView'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export default function MapPage() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const supabase = createSupabaseBrowserClient()

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        // Redirect to login if not authenticated
        window.location.href = '/login'
        return
      }

      setIsCheckingAuth(false)
    }
    checkAuth()
  }, [supabase])

  const handleStoreClick = (storeId: string) => {
    console.log('Store clicked:', storeId)
    // TODO: Navigate to negotiation with this store
    // For now, just log it
    alert(`Clicked on store: ${storeId}. Negotiation feature coming soon!`)
  }

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white mx-auto"></div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full flex-col bg-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/10 bg-black/80 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/negotiation"
            className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Chat
          </Link>
          <h1 className="text-xl font-semibold">Manhattan Stores</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-bold text-black">
            CA
          </div>
          <span className="text-base font-semibold">CartAI</span>
        </div>
      </header>

      {/* Map Container */}
      <main className="flex-1 p-6">
        <MapView onStoreClick={handleStoreClick} />
      </main>
    </div>
  )
}
