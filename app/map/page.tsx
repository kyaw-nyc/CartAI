'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { MapView } from '@/components/map/MapView'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useNegotiationStore } from '@/lib/store/negotiation'

export default function MapPage() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const supabase = createSupabaseBrowserClient()
  const router = useRouter()

  const {
    product,
    quantity,
    budget,
    chatMessages,
    setRequirements,
    setShowPrioritySelector,
    setSelectedStoreId,
    setUserId,
    loadUserNegotiations,
    savedConversations,
  } = useNegotiationStore()

  // Check auth and load negotiations on mount
  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        // Redirect to login if not authenticated
        window.location.href = '/login'
        return
      }

      // Set user ID and load negotiations
      setUserId(user.id)
      await loadUserNegotiations()

      setIsCheckingAuth(false)
    }
    checkAuthAndLoad()
  }, [supabase, setUserId, loadUserNegotiations])

  const handleNegotiate = (storeName: string, storeId: string) => {
    console.log('Negotiate clicked:', { storeName, storeId, product, quantity, budget, chatMessages: chatMessages.length })

    // Check if user has product requirements from current chat OR from saved conversations
    const hasRequirements = product && quantity && budget
    const hasConversations = savedConversations.length > 0

    if (!hasRequirements && !hasConversations) {
      alert(
        'Please start a conversation first to tell us what you want to buy! Click "Back to Chat" and describe what you need.'
      )
      return
    }

    // If no current requirements but has saved conversations, use the most recent one
    if (!hasRequirements && hasConversations) {
      const recentConv = savedConversations[0]
      if (recentConv.product && recentConv.quantity && recentConv.budget) {
        setRequirements(recentConv.product, recentConv.quantity, recentConv.budget)
        console.log(`Using saved conversation: ${recentConv.product}`)
      }
    }

    // Set the selected store for single-store negotiation
    setSelectedStoreId(storeId)
    console.log(`Selected store: ${storeName} (${storeId})`)

    // Show priority selector and navigate back to negotiation page
    setShowPrioritySelector(true)
    router.push('/negotiation')
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
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold">Manhattan Stores</h1>
            <p className="text-xs text-white/50">Click stores to see AI models and negotiate</p>
          </div>
          {product && (
            <div className="ml-4 rounded-lg border border-white/20 bg-white/5 px-3 py-1 text-sm">
              Looking for: <span className="font-semibold">{product}</span> (Qty: {quantity}, Budget: ${budget})
            </div>
          )}
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
        <MapView onNegotiateClick={handleNegotiate} />
      </main>

      {/* Help text if no product requirements and no saved conversations */}
      {(!product || !quantity || !budget) && savedConversations.length === 0 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-6 py-3 text-sm text-yellow-200 backdrop-blur-md">
          💡 Start a conversation first to tell us what you want to buy, then come back to the map to negotiate with stores!
        </div>
      )}

      {/* Info about using saved conversation */}
      {(!product || !quantity || !budget) && savedConversations.length > 0 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-6 py-3 text-sm text-blue-200 backdrop-blur-md">
          ℹ️ Click any store to negotiate using your recent conversation: "{savedConversations[0].title}"
        </div>
      )}
    </div>
  )
}
